CREATE TABLE public.saved_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  category TEXT,
  payout TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own saved opportunities" ON public.saved_opportunities
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own saved opportunities" ON public.saved_opportunities
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own saved opportunities" ON public.saved_opportunities
  FOR DELETE TO authenticated USING (auth.uid() = user_id);