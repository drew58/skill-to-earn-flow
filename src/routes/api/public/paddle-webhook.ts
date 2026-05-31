import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/paddle-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // NOTE: In production, verify Paddle webhook signature here
        // using PADDLE_WEBHOOK_SECRET before processing the payload.
        // const signature = request.headers.get("paddle-signature");
        // verifySignature(signature, body, process.env.PADDLE_WEBHOOK_SECRET);

        const body = await request.json().catch(() => null);
        if (!body) {
          return new Response(JSON.stringify({ error: "Invalid body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const eventType = body.event_type as string;
        const data = body.data ?? {};

        try {
          switch (eventType) {
            case "subscription.activated":
            case "subscription.updated": {
              const customerId = data.customer_id as string;
              const subId = data.id as string;
              const status = data.status as string;
              const tier = extractTierFromItems(data.items);
              const currentPeriodStart = data.current_billing_period?.starts_at;
              const currentPeriodEnd = data.current_billing_period?.ends_at;

              const { data: userRow } = await supabaseAdmin
                .from("profiles")
                .select("id")
                .eq("id", customerId)
                .maybeSingle();

              if (userRow) {
                await supabaseAdmin.from("subscriptions").upsert({
                  user_id: userRow.id,
                  tier,
                  status,
                  paddle_subscription_id: subId,
                  paddle_customer_id: customerId,
                  current_period_start: currentPeriodStart ? new Date(currentPeriodStart).toISOString() : null,
                  current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
                  cancel_at_period_end: data.scheduled_change?.action === "cancel",
                  updated_at: new Date().toISOString(),
                }, { onConflict: "user_id" });
              }
              break;
            }

            case "subscription.canceled": {
              const subId = data.id as string;
              const { data: subRow } = await supabaseAdmin
                .from("subscriptions")
                .select("user_id")
                .eq("paddle_subscription_id", subId)
                .maybeSingle();
              if (subRow) {
                await supabaseAdmin
                  .from("subscriptions")
                  .update({ status: "canceled", tier: "free", updated_at: new Date().toISOString() })
                  .eq("user_id", subRow.user_id);
              }
              break;
            }

            case "subscription.past_due": {
              const subId = data.id as string;
              await supabaseAdmin
                .from("subscriptions")
                .update({ status: "past_due", updated_at: new Date().toISOString() })
                .eq("paddle_subscription_id", subId);
              break;
            }

            default:
              console.log("Unhandled Paddle event:", eventType);
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("Paddle webhook error:", err);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});

function extractTierFromItems(items: any[]): "pro" | "accelerator" | "free" {
  if (!Array.isArray(items) || items.length === 0) return "free";
  const text = JSON.stringify(items).toLowerCase();
  if (text.includes("accelerator")) return "accelerator";
  if (text.includes("pro")) return "pro";
  return "free";
}
