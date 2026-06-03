import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function tierFromPlanCode(planCode?: string | null): "pro" | "accelerator" | null {
  if (!planCode) return null;
  if (planCode === process.env.PAYSTACK_PRO_PLAN_CODE) return "pro";
  if (planCode === process.env.PAYSTACK_ACCELERATOR_PLAN_CODE) return "accelerator";
  return null;
}

async function resolveUserId(opts: {
  metadataUserId?: string | null;
  customerEmail?: string | null;
}): Promise<string | null> {
  if (opts.metadataUserId) return opts.metadataUserId;
  if (opts.customerEmail) {
    // Look up via auth admin
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const u = data?.users?.find(
        (x) => x.email?.toLowerCase() === opts.customerEmail!.toLowerCase(),
      );
      return u?.id ?? null;
    } catch (e) {
      console.error("listUsers failed:", e);
    }
  }
  return null;
}

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return new Response("Not configured", { status: 500 });

        const raw = await request.text();
        const signature = request.headers.get("x-paystack-signature") || "";
        const expected = createHmac("sha512", secret).update(raw).digest("hex");

        try {
          const sigBuf = Buffer.from(signature, "hex");
          const expBuf = Buffer.from(expected, "hex");
          if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
            return new Response("Invalid signature", { status: 401 });
          }
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }

        let evt: any;
        try {
          evt = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const eventType = evt.event as string;
        const d = evt.data ?? {};

        try {
          switch (eventType) {
            case "charge.success":
            case "subscription.create":
            case "invoice.create":
            case "invoice.payment_failed":
            case "invoice.update": {
              const planCode =
                d.plan?.plan_code || d.plan_code || d.plan?.code || null;
              const tier = tierFromPlanCode(planCode);
              const email = d.customer?.email || null;
              const metaUserId =
                (d.metadata && (d.metadata.user_id || d.metadata.userId)) || null;
              const userId = await resolveUserId({
                metadataUserId: metaUserId,
                customerEmail: email,
              });

              if (!userId || !tier) {
                console.log("Skipping event - no user/tier:", eventType, { tier, userId });
                break;
              }

              const status =
                eventType === "invoice.payment_failed" ? "past_due" : "active";

              const subCode = d.subscription_code || d.subscription?.subscription_code || null;
              const customerCode = d.customer?.customer_code || null;
              const periodStart = d.paid_at || d.createdAt || new Date().toISOString();
              const periodEnd = d.next_payment_date || null;

              await supabaseAdmin.from("subscriptions").upsert(
                {
                  user_id: userId,
                  tier,
                  status,
                  paddle_subscription_id: subCode,
                  paddle_customer_id: customerCode,
                  current_period_start: periodStart ? new Date(periodStart).toISOString() : null,
                  current_period_end: periodEnd ? new Date(periodEnd).toISOString() : null,
                  cancel_at_period_end: false,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" },
              );
              break;
            }

            case "subscription.disable":
            case "subscription.not_renew": {
              const subCode = d.subscription_code || null;
              if (subCode) {
                await supabaseAdmin
                  .from("subscriptions")
                  .update({
                    status: "canceled",
                    tier: "free",
                    cancel_at_period_end: true,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("paddle_subscription_id", subCode);
              }
              break;
            }

            default:
              console.log("Unhandled Paystack event:", eventType);
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("Paystack webhook error:", err);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
