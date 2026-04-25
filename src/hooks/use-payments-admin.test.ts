import { describe, it, expect, beforeEach, vi } from "vitest";

// ---- Supabase mock ----
// Each test sets `mockState` to control what the chained query builder returns.

type MockResult = { data?: unknown; error?: unknown };

const mockState: {
  session: { data: { session: { user: { id: string } } | null } };
  fromHandlers: Record<string, () => MockResult>;
  insertSpy: ReturnType<typeof vi.fn>;
  updateSpy: ReturnType<typeof vi.fn>;
  deleteSpy: ReturnType<typeof vi.fn>;
} = {
  session: { data: { session: { user: { id: "admin-user-id" } } } },
  fromHandlers: {},
  insertSpy: vi.fn(),
  updateSpy: vi.fn(),
  deleteSpy: vi.fn(),
};

const makeSelectChain = (table: string) => {
  // Returns a thenable proxy where every chained method returns itself
  // and awaiting it resolves with mockState.fromHandlers[table]().
  const finalize = () => Promise.resolve(mockState.fromHandlers[table]?.() ?? { data: null, error: null });
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    order: () => chain,
    maybeSingle: () => finalize(),
    then: (resolve: any, reject: any) => finalize().then(resolve, reject),
  };
  return chain;
};

vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      auth: {
        getSession: () => Promise.resolve(mockState.session),
      },
      from: (table: string) => ({
        select: () => makeSelectChain(table),
        insert: (...args: unknown[]) => {
          mockState.insertSpy(table, ...args);
          return Promise.resolve(mockState.fromHandlers[`${table}:insert`]?.() ?? { error: null });
        },
        update: (...args: unknown[]) => {
          mockState.updateSpy(table, ...args);
          return {
            eq: () =>
              Promise.resolve(mockState.fromHandlers[`${table}:update`]?.() ?? { error: null }),
          };
        },
        delete: () => {
          mockState.deleteSpy(table);
          return {
            eq: () =>
              Promise.resolve(mockState.fromHandlers[`${table}:delete`]?.() ?? { error: null }),
          };
        },
      }),
    },
  };
});

// Import after mocks are registered
import { ensureAdmin, findDuplicatePayments, useCreatePayment, useBulkCreatePayments } from "./use-payments-admin";

const setUserRolesResponse = (data: unknown, error: unknown = null) => {
  mockState.fromHandlers["user_roles"] = () => ({ data, error });
};

const setPaymentsSelectResponse = (data: unknown, error: unknown = null) => {
  mockState.fromHandlers["payments"] = () => ({ data, error });
};

const setPaymentsInsertResponse = (error: unknown) => {
  mockState.fromHandlers["payments:insert"] = () => ({ error });
};

beforeEach(() => {
  mockState.session = { data: { session: { user: { id: "admin-user-id" } } } };
  mockState.fromHandlers = {};
  mockState.insertSpy.mockReset();
  mockState.updateSpy.mockReset();
  mockState.deleteSpy.mockReset();
});

// ---- ensureAdmin ----
describe("ensureAdmin", () => {
  it("returns ok=true when the user has the admin role in user_roles", async () => {
    setUserRolesResponse({ role: "admin" });
    const result = await ensureAdmin();
    expect(result.ok).toBe(true);
  });

  it("returns ok=false with friendly reason when the user is NOT admin", async () => {
    setUserRolesResponse(null);
    const result = await ensureAdmin();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/permissão de administrador/i);
    }
  });

  it("returns ok=false when there is no logged-in session", async () => {
    mockState.session = { data: { session: null } };
    const result = await ensureAdmin();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/logado/i);
  });

  it("returns ok=false when the role lookup itself errors", async () => {
    setUserRolesResponse(null, { message: "boom" });
    const result = await ensureAdmin();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/verificar suas permissões/i);
  });
});

// ---- findDuplicatePayments ----
describe("findDuplicatePayments", () => {
  it("returns the user_ids that already have a payment for the given month", async () => {
    setPaymentsSelectResponse([{ user_id: "u1" }, { user_id: "u3" }]);
    const dups = await findDuplicatePayments(["u1", "u2", "u3"], "Março 2026");
    expect(dups).toEqual(["u1", "u3"]);
  });

  it("returns an empty array when the userIds list is empty (no DB call needed)", async () => {
    const dups = await findDuplicatePayments([], "Março 2026");
    expect(dups).toEqual([]);
  });

  it("returns an empty array (graceful) when the query errors out", async () => {
    setPaymentsSelectResponse(null, { message: "rls" });
    const dups = await findDuplicatePayments(["u1"], "Março 2026");
    expect(dups).toEqual([]);
  });

  it("returns an empty array when no duplicates exist", async () => {
    setPaymentsSelectResponse([]);
    const dups = await findDuplicatePayments(["u1", "u2"], "Abril 2026");
    expect(dups).toEqual([]);
  });
});

// ---- friendlyError surfaced via mutationFn ----
// We invoke mutationFn directly — react-query is not needed for this assertion.
describe("useCreatePayment.mutationFn — friendly error surfacing", () => {
  const payload = { user_id: "u1", month: "Março 2026", amount: 250, due_date: "2026-03-10" };

  it("blocks early with admin-friendly message when the user is not admin", async () => {
    setUserRolesResponse(null);
    const mutation = useCreatePayment();
    await expect(mutation.options.mutationFn!(payload)).rejects.toThrow(/permissão de administrador/i);
    // Did not even attempt to insert
    expect(mockState.insertSpy).not.toHaveBeenCalled();
  });

  it("translates Postgres RLS error (42501) to a friendly toast message", async () => {
    setUserRolesResponse({ role: "admin" });
    setPaymentsInsertResponse({ code: "42501", message: "new row violates row-level security policy" });
    const mutation = useCreatePayment();
    await expect(mutation.options.mutationFn!(payload)).rejects.toThrow(/permissão negada pelo banco/i);
  });

  it("translates Postgres duplicate key (23505) to a friendly toast message", async () => {
    setUserRolesResponse({ role: "admin" });
    setPaymentsInsertResponse({ code: "23505", message: "duplicate key value violates unique constraint" });
    const mutation = useCreatePayment();
    await expect(mutation.options.mutationFn!(payload)).rejects.toThrow(/já existe uma mensalidade/i);
  });

  it("falls back to the generic error message for unknown DB errors", async () => {
    setUserRolesResponse({ role: "admin" });
    setPaymentsInsertResponse({ code: "XX000", message: "internal error" });
    const mutation = useCreatePayment();
    await expect(mutation.options.mutationFn!(payload)).rejects.toThrow(/erro ao criar mensalidade/i);
  });

  it("succeeds (no throw) when insert resolves cleanly", async () => {
    setUserRolesResponse({ role: "admin" });
    setPaymentsInsertResponse(null);
    const mutation = useCreatePayment();
    await expect(mutation.options.mutationFn!(payload)).resolves.toBeUndefined();
    expect(mockState.insertSpy).toHaveBeenCalledWith("payments", payload);
  });
});

describe("useBulkCreatePayments.mutationFn — friendly error surfacing", () => {
  const params = { userIds: ["u1", "u2"], month: "Março 2026", amount: 250, due_date: "2026-03-10" };

  it("blocks with admin error before touching the DB", async () => {
    setUserRolesResponse(null);
    const mutation = useBulkCreatePayments();
    await expect(mutation.options.mutationFn!(params)).rejects.toThrow(/permissão de administrador/i);
    expect(mockState.insertSpy).not.toHaveBeenCalled();
  });

  it("translates RLS errors when bulk inserting", async () => {
    setUserRolesResponse({ role: "admin" });
    setPaymentsInsertResponse({ code: "42501", message: "row-level security" });
    const mutation = useBulkCreatePayments();
    await expect(mutation.options.mutationFn!(params)).rejects.toThrow(/permissão negada pelo banco/i);
  });

  it("inserts one row per user_id when admin and DB are healthy", async () => {
    setUserRolesResponse({ role: "admin" });
    setPaymentsInsertResponse(null);
    const mutation = useBulkCreatePayments();
    await mutation.options.mutationFn!(params);
    const [, rows] = mockState.insertSpy.mock.calls[0];
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ user_id: "u1", month: "Março 2026" });
    expect(rows[1]).toMatchObject({ user_id: "u2", month: "Março 2026" });
  });
});
