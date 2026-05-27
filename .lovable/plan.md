## Scope & sequence

The Opportunity Explorer page is already live. I'll build the remaining work in 4 focused slices so we can ship + verify each before moving on. Newsletter is included as a small final touch since you mentioned it.

---

### Slice 1 — Smart platform matching (decision logic)
Make Angie's recommendations actually intelligent so beginners aren't pushed to Toptal and Nigerian users get payout-accessible platforms.

- Extend `profiles` with: `country`, `experience_level` (already exists), `weekly_hours`, `payment_methods` (array), `has_paypal`, `has_wise`, `has_stripe`.
- Add a per-opportunity metadata block (level, payout regions, payout methods, competition score, time-to-first-dollar) to the Opportunities catalog.
- Add a pure matching function `scoreOpportunity(user, opp)` used by:
  - the `/dashboard/opportunities` "Recommended for you" rail
  - the Coach chat (Slice 2) when it suggests platforms
- Surface a "Why this fits you" badge on recommended cards.

### Slice 2 — Angie Coach: conversational AI with memory
Turn Angie into a true personal coach instead of a one-shot generator.

- New route `/dashboard/coach` — full-height chat UI with glass design, streaming tokens, markdown rendering.
- New tables:
  - `coach_conversations` (one per user, single thread for now)
  - `coach_messages` (role, content, metadata, created_at)
  - `user_memory` (key/value rows: long-term goals, weekly target, focus skill, blockers, wins) — surfaced in every prompt
- New server fn `chatWithCoach` calling Lovable AI Gateway (Gemini 3 Flash, streaming) with:
  - system prompt that includes user profile + memory + active plan + today's missions + recent saved opportunities
  - tool calls for: `update_memory`, `set_weekly_goal`, `add_mission`, `suggest_platforms` (uses matching logic from Slice 1)
- Dashboard home gets a "Today from Angie" card with 1 contextual nudge + a "Chat with Angie" CTA.

### Slice 3 — Instant Apply Assistant
One place to upload a CV, paste a LinkedIn URL, pick an opportunity, and generate platform-tailored applications.

- New route `/dashboard/apply` (also reachable as "Quick apply" deep link from any opportunity card with `?opp=<id>`).
- New storage bucket `resumes` (private, owner-only RLS).
- New table `applications` (opportunity_id, platform, kind, content, created_at) so users can review past generations.
- Flow:
  1. Upload CV (PDF/DOCX, parsed server-side to text) OR paste resume text OR paste LinkedIn URL.
  2. Pick a target opportunity (search/select from Explorer catalog or saved list).
  3. Choose output: Cover letter · Upwork proposal · Fiverr gig description · LinkedIn message · Email pitch.
  4. Server fn `generateApplication` calls Lovable AI with a platform-aware prompt template (Upwork = short, results-led; Fiverr = SEO + packages; Toptal = senior tone, etc.).
  5. Result rendered with markdown + copy button + "Save" + "Open platform" deep link.
- "Quick apply" buttons on Opportunity cards now route here with the opportunity pre-selected.

> LinkedIn API requires per-user OAuth + app review. For v1 we'll accept a public LinkedIn URL the user pastes and extract what we can server-side; a real OAuth integration would be a follow-up if you want it.

### Slice 4 — Newsletter signup (small)
- New table `newsletter_subscribers` (email, source, created_at; unique email).
- Public server route `/api/public/subscribe` with zod validation + rate-limit-friendly insert (ignore-on-conflict).
- Add a polished glass section on the landing page: "Get weekly income drops". Email input + button + success state.
- (No sending infra yet — you can wire Resend/Mailgun later when you want to actually send.)

### Adaptive missions & follow-ups (folded in)
These are wired across the slices rather than a separate page:
- Coach tool `add_mission` writes into existing `missions` table → "adaptive daily missions".
- After completing a mission, dashboard shows a Coach follow-up nudge ("Nice — want me to draft the outreach for it?").

---

## Technical notes (for the curious)

- **Stack**: Stays on TanStack Start + Lovable Cloud + Lovable AI Gateway. No new third-party deps required for slices 1–2 & 4. Slice 3 adds `pdfjs-dist` (or `pdf-parse` if Worker-compatible) for CV parsing; if neither works on Cloudflare Workers I'll fall back to a text-only paste flow.
- **AI**: `google/gemini-3-flash-preview` for chat + generators; streaming via existing edge-function pattern in `supabase/functions/`. Memory is plain SQL — not a vector DB — which is the right call at this scale.
- **Security**: RLS on all new tables; resumes bucket is private with `auth.uid()::text` folder-scoped policies; newsletter endpoint validates with zod and silently dedupes.
- **Design**: Reuses the new glass + glow tokens we just added — no new design system work.

---

## What I will NOT build (per "skip what isn't needed")
- Real LinkedIn OAuth (requires app review + per-user OAuth infra).
- Newsletter sending infra (table + signup only — wire Resend later).
- Multi-thread chat history (single ongoing conversation is enough for v1).
- Vector embeddings for memory (overkill — structured rows are better here).

---

I'll start with **Slice 1** as soon as you approve, then move to 2 → 3 → 4. Tell me if you want to drop, reorder, or expand any slice.