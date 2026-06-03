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

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
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
      console.error("Paystack init failed:", json);
      throw new Error(json.message || "Failed to start checkout");
    }

    return {
      authorization_url: json.data.authorization_url,
      reference: json.data.reference,
    };
  });
