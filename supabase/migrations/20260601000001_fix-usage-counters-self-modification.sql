-- Drop the insecure UPDATE policy that allowed users to modify their own usage counters
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_counters;

-- Keep only SELECT policy for users to view their usage
-- All updates must go through service_role via secure backend functions
