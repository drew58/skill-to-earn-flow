import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PLAN_CODES: Record<"pro" | "accelerator", string | undefined> = {
  pro: process.env.PAYSTACK_PRO_PLAN_CODE,
  accelerator: process.env.PAYSTACK_ACCELERATOR_PLAN_CODE,
};

export const initPaystackCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { tier: "pro" | "accelerator"; callbackUrl: string }) => {
    if (input.tier !== "pro" && input.tier !== "accelerator") {
      throw new Error("Invalid tier");
    }
    if (typeof input.callbackUrl !== "string" || !input.callbackUrl.startsWith("http")) {
      throw new Error("Invalid callback URL");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Paystack is not configured");

    const plan = PLAN_CODES[data.tier];
    if (!plan) throw new Error(`Plan code not configured for ${data.tier}`);

    const { userId, supabase } = context;
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes.user?.email;
    if (!email) throw new Error("No email on account");

    // Fetch the plan to get its amount + currency (Paystack requires `amount`
    // on transaction/initialize and the currency must match the plan).
    const planRes = await fetch(`https://api.paystack.co/plan/${plan}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const planJson = (await planRes.json()) as {
      status?: boolean;
      message?: string;
      data?: { amount?: number; currency?: string };
    };
    if (!planRes.ok || !planJson.status || !planJson.data?.amount) {
      console.error("Paystack plan lookup failed:", planJson);
      throw new Error(planJson.message || "Failed to load plan");
    }
    const amount = planJson.data.amount;
    const currency = planJson.data.currency;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency,
        plan,
        callback_url: data.callbackUrl,
        metadata: { user_id: userId, tier: data.tier },
      }),
    });

    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string; reference?: string };
    };

    if (!res.ok || !json.status || !json.data?.authorization_url) {
      console.error("Paystack init failed:", json, { amount, currency, plan });
      throw new Error(json.message || "Failed to start checkout");
    }

    return {
      authorization_url: json.data.authorization_url,
      reference: json.data.reference,
    };
  });
