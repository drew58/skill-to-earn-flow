// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are Angie, an AI income strategist.
Your goal is to help users realistically turn their skills, time, and goals into income opportunities.

You must:
- be practical
- avoid hype
- prioritize execution
- focus on realistic opportunities
- give actionable steps
- tailor answers to the user's country and skill level

Always produce: top 3 opportunities, a best recommendation, a 7-day execution plan,
client acquisition methods, pricing guidance, outreach scripts, and a first 24-hour action plan.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { skills, country, time, level, goal } = await req.json();
    if (!Array.isArray(skills) || skills.length === 0) {
      return new Response(JSON.stringify({ error: "skills required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `User profile:
- Skills: ${skills.join(", ")}
- Country: ${country}
- Time available: ${time}
- Experience level: ${level}
- Goal: ${goal}

Build their realistic income execution plan now.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "emit_income_plan",
          description: "Return the structured income execution plan.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short plan title, max 60 chars." },
              top_opportunities: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    why: { type: "string" },
                    effort: { type: "string", description: "low / medium / high + brief reason" },
                  },
                  required: ["name", "why", "effort"],
                },
              },
              best_recommendation: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  rationale: { type: "string" },
                },
                required: ["name", "rationale"],
              },
              action_plan_7_days: {
                type: "array",
                minItems: 7,
                maxItems: 7,
                items: {
                  type: "object",
                  properties: {
                    day: { type: "integer" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
                  },
                  required: ["day", "focus", "tasks"],
                },
              },
              client_acquisition: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 6,
              },
              pricing_strategy: { type: "string" },
              outreach_scripts: {
                type: "array",
                minItems: 3,
                maxItems: 5,
                items: {
                  type: "object",
                  properties: {
                    channel: { type: "string", description: "e.g. Cold DM, Client email, LinkedIn, Instagram" },
                    script: { type: "string" },
                  },
                  required: ["channel", "script"],
                },
              },
              first_24h_actions: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 6,
              },
            },
            required: [
              "title",
              "top_opportunities",
              "best_recommendation",
              "action_plan_7_days",
              "client_acquisition",
              "pricing_strategy",
              "outreach_scripts",
              "first_24h_actions",
            ],
            additionalProperties: false,
          },
        },
      },
    ];

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "emit_income_plan" } },
      }),
    });

    if (!r.ok) {
      if (r.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (r.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await r.text();
      console.error("AI gateway error", r.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    if (!args) throw new Error("No tool_call in AI response");
    const plan = typeof args === "string" ? JSON.parse(args) : args;

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-plan error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
