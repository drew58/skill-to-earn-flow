// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_BASE = `You are Angie, the user's personal AI income coach.

Personality: direct, motivating, calm, never hype-y. You speak like a smart friend who has shipped many side incomes herself.

Your job each turn:
1. Read the user's profile, memory, current plan, today's missions, and recent messages.
2. Answer their message with concrete, actionable next steps.
3. When you learn something durable about them (goals, focus skill, blockers, wins, weekly target), call save_memory.
4. When you spot a clearly useful next action they should do today or tomorrow, call add_mission.
5. When they ask "what should I do?", suggest 2-3 specific platforms or moves that fit their level, country, and payment methods. Avoid recommending highly competitive platforms (Toptal, Arc, top-tier agencies) to beginners.

Rules:
- Never invent income figures. Talk in realistic ranges.
- Prefer beginner-friendly, fast-payout platforms when the user is new.
- If they're in Nigeria, Pakistan, Bangladesh, Kenya, Ghana, India, Philippines: prioritize Payoneer/Wise-friendly platforms (Upwork, Fiverr, Contra, Appen) over PayPal-only or Stripe-only ones.
- Keep replies focused. Markdown OK. No giant essays unless asked.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim()) return json({ error: "message required" }, 400);

    // Ensure conversation
    let { data: conv } = await supabase.from("coach_conversations").select("id").eq("user_id", user.id).maybeSingle();
    if (!conv) {
      const ins = await supabase.from("coach_conversations").insert({ user_id: user.id }).select("id").single();
      conv = ins.data;
    }
    const conversationId = conv!.id;

    // Save user message
    await supabase.from("coach_messages").insert({
      user_id: user.id, conversation_id: conversationId, role: "user", content: message,
    });

    // Context
    const [{ data: profile }, { data: memory }, { data: missions }, { data: plans }, { data: history }] = await Promise.all([
      supabase.from("profiles").select("display_name,country,experience_level,skills,goals,weekly_hours,payment_methods").eq("id", user.id).maybeSingle(),
      supabase.from("user_memory").select("key,value").eq("user_id", user.id),
      supabase.from("missions").select("title,completed,due_date").eq("user_id", user.id).order("due_date", { ascending: false }).limit(8),
      supabase.from("plans").select("title,content,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      supabase.from("coach_messages").select("role,content").eq("conversation_id", conversationId).order("created_at").limit(20),
    ]);

    const memoryStr = (memory ?? []).map((m: any) => `- ${m.key}: ${m.value}`).join("\n") || "(none yet)";
    const missionsStr = (missions ?? []).map((m: any) => `- [${m.completed ? "x" : " "}] ${m.title} (${m.due_date})`).join("\n") || "(none)";
    const planStr = plans?.[0] ? `Active plan: "${plans[0].title}"` : "No active plan yet.";
    const profileStr = profile
      ? `Name: ${profile.display_name ?? "?"}, Country: ${profile.country ?? "?"}, Level: ${profile.experience_level ?? "?"}, Skills: ${(profile.skills ?? []).join(", ") || "?"}, Weekly hours: ${profile.weekly_hours ?? "?"}, Payment methods: ${(profile.payment_methods ?? []).join(", ") || "?"}, Goals: ${profile.goals ?? "?"}`
      : "Profile not filled in yet.";

    const system = `${SYSTEM_BASE}

--- USER PROFILE ---
${profileStr}

--- LONG-TERM MEMORY ---
${memoryStr}

--- CURRENT ${planStr} ---
Recent missions:
${missionsStr}`;

    const tools = [
      { type: "function", function: { name: "save_memory", description: "Persist a durable fact about the user (goal, focus skill, blocker, win, weekly target).", parameters: { type: "object", properties: { key: { type: "string", enum: ["long_term_goal", "weekly_income_target", "focus_skill", "blocker", "recent_win", "preferred_platform"] }, value: { type: "string" } }, required: ["key", "value"] } } },
      { type: "function", function: { name: "add_mission", description: "Add a concrete daily mission to the user's mission list.", parameters: { type: "object", properties: { title: { type: "string" }, due_date: { type: "string", description: "YYYY-MM-DD, today or tomorrow" } }, required: ["title"] } } },
    ];

    const messages = [
      { role: "system", content: system },
      ...((history ?? []).filter((m: any) => m.role === "user" || m.role === "assistant").map((m: any) => ({ role: m.role, content: m.content }))),
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages, tools }),
    });

    if (!r.ok) {
      if (r.status === 429) return json({ error: "Rate limited. Try again shortly." }, 429);
      if (r.status === 402) return json({ error: "AI credits exhausted." }, 402);
      const t = await r.text();
      console.error("AI gateway error", r.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const data = await r.json();
    const choice = data?.choices?.[0]?.message;
    const reply: string = choice?.content || "";
    const toolCalls = choice?.tool_calls ?? [];

    const actions: { kind: string; result: any }[] = [];
    for (const tc of toolCalls) {
      const name = tc?.function?.name;
      let args: any = {};
      try { args = JSON.parse(tc?.function?.arguments ?? "{}"); } catch { /* ignore */ }
      if (name === "save_memory" && args.key && args.value) {
        await supabase.from("user_memory").upsert({ user_id: user.id, key: args.key, value: args.value, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
        actions.push({ kind: "memory_saved", result: args });
      } else if (name === "add_mission" && args.title) {
        const due = args.due_date || new Date().toISOString().slice(0, 10);
        await supabase.from("missions").insert({ user_id: user.id, title: args.title, due_date: due });
        actions.push({ kind: "mission_added", result: { title: args.title, due_date: due } });
      }
    }

    const finalReply = reply || (actions.length ? "Done." : "I'm here — tell me a bit more.");

    await supabase.from("coach_messages").insert({
      user_id: user.id, conversation_id: conversationId, role: "assistant",
      content: finalReply, metadata: { actions },
    });
    await supabase.from("coach_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return json({ reply: finalReply, actions });
  } catch (e: any) {
    console.error("coach-chat error", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
