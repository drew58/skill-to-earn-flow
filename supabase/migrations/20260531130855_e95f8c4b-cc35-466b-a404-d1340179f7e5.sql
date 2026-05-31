-- Fix security warnings: revoke EXECUTE on SECURITY DEFINER function from public/authenticated
-- Only service_role should be able to call this function directly
REVOKE EXECUTE ON FUNCTION public.get_or_create_usage_counters(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_or_create_usage_counters(uuid) FROM authenticated;

-- Ensure service_role retains access
GRANT EXECUTE ON FUNCTION public.get_or_create_usage_counters(uuid) TO service_role;