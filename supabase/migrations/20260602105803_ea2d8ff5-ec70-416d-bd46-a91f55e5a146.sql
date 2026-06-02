
-- 1) Subscriptions: remove user-side UPDATE (only service_role / webhook may mutate billing)
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- 2) Usage counters: remove user-side INSERT/UPDATE; route through security-definer RPC
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_counters;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_counters;

CREATE OR REPLACE FUNCTION public.increment_usage_counter(_feature text)
RETURNS public.usage_counters
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  row public.usage_counters;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure row exists and counters are reset for current period
  row := public.get_or_create_usage_counters(uid);

  IF _feature = 'plans' THEN
    UPDATE public.usage_counters SET plans_this_month = plans_this_month + 1 WHERE user_id = uid RETURNING * INTO row;
  ELSIF _feature = 'coach' THEN
    UPDATE public.usage_counters SET coach_messages_today = coach_messages_today + 1 WHERE user_id = uid RETURNING * INTO row;
  ELSIF _feature = 'missions' THEN
    UPDATE public.usage_counters SET missions_today = missions_today + 1 WHERE user_id = uid RETURNING * INTO row;
  ELSIF _feature = 'applications' THEN
    UPDATE public.usage_counters SET applications_today = applications_today + 1 WHERE user_id = uid RETURNING * INTO row;
  ELSE
    RAISE EXCEPTION 'Unknown feature: %', _feature;
  END IF;

  RETURN row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_usage_counter(text) TO authenticated;

-- 3) Newsletter subscribers: explicit deny on client SELECT (defense in depth)
CREATE POLICY "No client read of subscribers"
ON public.newsletter_subscribers
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);
