-- Drop the insecure UPDATE policy that allowed users to modify their own subscriptions
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- Keep only SELECT policy for users to view their subscription
-- All updates must go through service_role (Paddle webhook)
