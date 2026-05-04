import { describe, it, expect } from "vitest";
import { monthFromDueDate, normalizeMonthKey } from "./month";

describe("monthFromDueDate (timezone-safe)", () => {
  it("derives the month from a YYYY-MM-DD without UTC drift", () => {
    // Em UTC isso seria 28/02 no horário de Brasília (UTC-3) — o helper
    // precisa interpretar localmente e devolver Março.
    expect(monthFromDueDate("2026-03-01")).toBe("Março 2026");
  });

  it("handles end-of-month dates correctly", () => {
    expect(monthFromDueDate("2026-12-31")).toBe("Dezembro 2026");
    expect(monthFromDueDate("2026-01-01")).toBe("Janeiro 2026");
  });

  it("returns null for invalid input", () => {
    expect(monthFromDueDate("")).toBeNull();
    expect(monthFromDueDate("31/12/2026")).toBeNull();
    expect(monthFromDueDate("2026-13-01")).toBeNull();
  });
});

describe("normalizeMonthKey", () => {
  it("treats accents/case/extra spaces as equivalent", () => {
    const a = normalizeMonthKey("Março 2026");
    expect(normalizeMonthKey("marco 2026")).toBe(a);
    expect(normalizeMonthKey("MARÇO 2026")).toBe(a);
    expect(normalizeMonthKey("  março   2026 ")).toBe(a);
  });

  it("keeps different months distinct", () => {
    expect(normalizeMonthKey("Março 2026")).not.toBe(normalizeMonthKey("Marco 2025"));
  });
});
