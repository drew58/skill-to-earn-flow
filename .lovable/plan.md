# Fix pack: profile, theme, settings, missions, outreach, apply, opportunities

## 1. Profile builder → live "job profile" view
- In `src/routes/dashboard.profile.tsx`, show the **Job Profile Preview** card automatically whenever profile data has been saved (not only the moment after Save). Add an **Edit profile** toggle so the form is collapsed by default once a profile exists, and only shown when the user clicks Edit.
- Resume input already supports PDF/DOC/DOCX/JPG/PNG, so leave that as-is — just clarify the label to "Attach file or photo".

## 2. Theme toggle + settings polish
- The light/dark toggle already exists in Settings. I'll verify `src/styles.css` actually defines `.light` tokens used by core components; if any glass/background utility hard-codes dark colors, swap to semantic tokens so the toggle visibly changes the UI.
- Keep Settings sections (Account, Profile/Display name, Appearance, Subscription, Security/Sign out) — already functional, no changes needed beyond ensuring theme actually applies.

## 3. Settings visible on mobile
- `DashboardShell` mobile bottom nav currently shows 5 items and omits Settings. Replace one slot (Outreach) with **Settings**, and surface Outreach inside the dashboard sidebar grouping only on desktop. (Outreach remains reachable from the desktop sidebar and from Income Plans → outreach scripts section.)

## 4. Missions wiring
- Already loads from the `missions` table and displays generated ones grouped by Today/Upcoming/Past. No change needed beyond confirming generation in `plans/new` continues to insert today's tasks. (Verified — it already does.)

## 5. Outreach section becomes functional
- Rewrite `src/routes/dashboard.outreach.tsx` to:
  - List all `outreach_scripts` pulled from every plan in the `plans` table for the user.
  - Per script: show channel (LinkedIn / Cold email / Cold DM / etc.), copy button, and a **Fine-tune** dropdown letting the user pick a tone preset (More casual, More formal, Shorter, LinkedIn-optimized, Cold-DM-optimized, Cold-email-optimized). Fine-tune calls the existing `generate-application` edge function with the script + chosen preset to rewrite it, then shows the rewritten version inline.
  - Empty state with link to generate a plan if no scripts exist yet.

## 6. Instant Apply: free tier gets 4
- In `src/hooks/use-subscription.ts`: change free tier from `instantApply: false, applicationsPerDay: 2` to `instantApply: true, applicationsPerDay: 4`.
- In `src/routes/dashboard.apply.tsx`: remove the hard Paywall gate; instead show a quota banner ("X of 4 free applications left today") and call `increment("applications")` after a successful generation. Block generation when `remaining("applicationsPerDay") <= 0` with an upgrade CTA.

## 7. Opportunities tied to the latest plan
- In `src/routes/dashboard.opportunities.tsx`, add a new top section **"From your latest plan"** that:
  - Loads the user's most recent plan (`plans` table, latest `created_at`).
  - Renders `top_opportunities[]` and `best_recommendation` as opportunity-style cards with a search link out.
- Keep the existing hand-curated list as **"Hot jobs & platforms"** below.
- Search input already filters live across title/platform/description/tags — no change needed there. I'll wire the curated cards to also be clickable into Instant Apply (already are via the Save → Apply flow; confirming).
- Note: true real-time job board scraping is out of scope (requires paid APIs / scraping). The plan-derived section gives the personalized feel the user asked for without infra changes. I'll call this out in the UI as "Pulled from your latest plan".

## 8. Payments — Paystack only
- Already done in a prior turn. Paddle/Payoneer are no longer referenced on the pricing page; only Paystack is wired. No change needed unless the user still sees Paddle text — I'll grep to confirm.

---

## Files touched
- `src/routes/dashboard.profile.tsx` — preview-by-default + edit toggle
- `src/routes/dashboard.outreach.tsx` — full rewrite, scripts + fine-tune
- `src/routes/dashboard.opportunities.tsx` — add "From your latest plan" section
- `src/routes/dashboard.apply.tsx` — quota banner, no paywall, increment on success
- `src/hooks/use-subscription.ts` — free tier allows 4 Instant Apply uses/day
- `src/components/angie/DashboardShell.tsx` — Settings in mobile bottom nav
- `src/styles.css` — verify/add `.light` tokens if missing
- Grep for residual "Paddle" / "Payoneer" strings and remove

## Not in scope (would need follow-up)
- Real-time live job board feed (requires LinkedIn/Indeed/Upwork API or scraper + caching infra)
- AI-rewriting outreach beyond what `generate-application` already returns
