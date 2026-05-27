// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_RULES: Record<string, string> = {
  Upwork: "Upwork proposal: open with a hook addressing the client's pain in their own words. 120-180 words. Show 1-2 concrete results. End with one short question. No 'I am writing to apply'. No emojis.",
  Fiverr: "Fiverr gig: SEO-friendly title (≤80 chars), 3 packages (Basic/Standard/Premium) with deliverables + delivery days + price ranges, and a benefit-led description in short scannable lines. No 'Hi, I am'.",
  Toptal: "Senior-tone cover letter, 180-240 words, lead with a quantified result, demonstrate systems thinking. Avoid junior phrases.",
  RemoteOK: "Tight cover letter, 150-200 words. Hook in line 1. Quantified bullet of impact. Why-this-company line. Plain confident close.",
  Contra: "Independent designer pitch, 120-180 words, warm but pro tone, link a relevant past project description.",
  Wellfound: "Founder-direct pitch, 120-180 words, show you understand their stage, end with a concrete way you'd help in week 1.",
  LinkedIn: "Short LinkedIn DM, max 90 words, conversational, no salesy opener, end with a low-friction question.",
  Default: "Concise, specific, results-led. No fluff. No emojis unless it's a creator gig.",
};

const KIND_TEMPLATES: Record<string, string> = {
  "cover-letter": "Write a tailored cover letter.",
  "proposal": "Write a tailored job proposal.",
  "gig": "Write a marketplace gig listing with title + 3 packages + description.",
  "linkedin-message": "Write a short LinkedIn outreach message.",
  "email-pitch": "Write a short cold email pitch with subject line.",
};

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

    const body = await req.json();
    const {
      opportunity_id, platform, kind, opportunity_title, opportunity_description,
      resume_text, linkedin_url, extra_notes,
    } = body ?? {};

    if (!kind || !KIND_TEMPLATES[kind]) return json({ error: "invalid kind" }, 400);

    const { data: profile } = await supabase.from("profiles")
      .select("display_name,country,experience_level,skills,goals,resume_text,linkedin_url")
      .eq("id", user.id).maybeSingle();

    const resume = (resume_text ?? profile?.resume_text ?? "").toString().slice(0, 6000);
    const li = linkedin_url || profile?.linkedin_url || "";

    const rule = PLATFORM_RULES[platform as string] ?? PLATFORM_RULES.Default;
    const taskLine = KIND_TEMPLATES[kind];

    const system = `You are Angie, an AI that writes application materials that actually get replies.
Be specific, human, and lean. Avoid AI-tells like "I am thrilled to apply" or "synergy".
Follow the platform format strictly.`;

    const userPrompt = `Generate this asset: ${taskLine}
Target platform: ${platform || "Generic"}
Platform style rules: ${rule}

OPPORTUNITY:
Title: ${opportunity_title || "(unspecified)"}
Description: ${opportunity_description || "(unspecified)"}

USER PROFILE:
Name: ${profile?.display_name ?? ""}
Country: ${profile?.country ?? ""}
Level: ${profile?.experience_level ?? ""}
Skills: ${(profile?.skills ?? []).join(", ")}
Goals: ${profile?.goals ?? ""}
LinkedIn: ${li}

RESUME / BACKGROUND:
${resume || "(no resume provided — infer from skills + goals)"}

EXTRA NOTES FROM USER:
${extra_notes || "(none)"}

Output ONLY the final asset, formatted in clean markdown. No preamble, no "Here is your...".`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }],
      }),
    });

    if (!r.ok) {
      if (r.status === 429) return json({ error: "Rate limited. Try again shortly." }, 429);
      if (r.status === 402) return json({ error: "AI credits exhausted." }, 402);
      const t = await r.text();
      console.error("AI gateway error", r.status, t);
      return json({ error: "AI gateway error" }, 500);
    }
    const data = await r.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    if (!content) return json({ error: "Empty response" }, 500);

    await supabase.from("applications").insert({
      user_id: user.id,
      opportunity_id: opportunity_id ?? null,
      platform: platform ?? null,
      kind,
      content,
      input: { opportunity_title, extra_notes, has_resume: Boolean(resume) },
    });

    return json({ content });
  } catch (e: any) {
    console.error("generate-application error", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
