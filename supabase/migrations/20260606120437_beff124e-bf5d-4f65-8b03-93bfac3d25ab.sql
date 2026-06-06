
-- Lock down SECURITY DEFINER functions: revoke broad EXECUTE, grant only where needed
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_or_create_usage_counters(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_usage_counter(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_usage_counters(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_usage_counter(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Enable realtime for missions so generated missions appear instantly
ALTER TABLE public.missions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;
