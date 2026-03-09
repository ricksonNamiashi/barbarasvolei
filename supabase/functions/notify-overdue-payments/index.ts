import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // --- Admin authorization check ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub as string;

    // Use service role client to check admin role
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // --- End admin check ---

    // Find all overdue payments
    const { data: overduePayments, error: paymentsError } = await supabase
      .from("payments")
      .select("id, user_id, month, amount, due_date")
      .eq("status", "overdue");

    if (paymentsError) throw paymentsError;

    if (!overduePayments || overduePayments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No overdue payments found", notified: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check which notifications already exist (avoid duplicates)
    const paymentIds = overduePayments.map((p) => p.id);
    const { data: existingNotifs } = await supabase
      .from("notifications")
      .select("payment_id")
      .in("payment_id", paymentIds)
      .eq("type", "payment_overdue");

    const existingPaymentIds = new Set(
      (existingNotifs ?? []).map((n) => n.payment_id)
    );

    // Filter to only new overdue payments
    const newOverdue = overduePayments.filter(
      (p) => !existingPaymentIds.has(p.id)
    );

    if (newOverdue.length === 0) {
      return new Response(
        JSON.stringify({
          message: "All overdue payments already notified",
          notified: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get profile names for personalized messages
    const userIds = [...new Set(newOverdue.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

    const nameMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.name])
    );

    // Create in-app notifications
    const notifications = newOverdue.map((p) => ({
      user_id: p.user_id,
      title: "Pagamento atrasado",
      message: `Olá ${nameMap.get(p.user_id) ?? "aluno"}! Sua mensalidade de ${p.month} no valor de R$ ${Number(p.amount).toFixed(2).replace(".", ",")} está atrasada. Vencimento: ${new Date(p.due_date).toLocaleDateString("pt-BR")}. Regularize o quanto antes.`,
      type: "payment_overdue",
      payment_id: p.id,
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) throw insertError;

    console.log(
      `Created ${notifications.length} overdue payment notifications for ${userIds.length} users`
    );

    return new Response(
      JSON.stringify({
        message: `Notified ${notifications.length} overdue payments`,
        notified: notifications.length,
        users: userIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
