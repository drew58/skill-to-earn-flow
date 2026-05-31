-- Revoke default PUBLIC access which Postgres grants automatically
REVOKE EXECUTE ON FUNCTION public.get_or_create_usage_counters(uuid) FROM PUBLIC;

-- Only service_role can execute this function
GRANT EXECUTE ON FUNCTION public.get_or_create_usage_counters(uuid) TO service_role;