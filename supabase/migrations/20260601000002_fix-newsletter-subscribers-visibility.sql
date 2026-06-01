-- Drop the policy that allowed anyone to read newsletter subscriber emails
DROP POLICY IF EXISTS "newsletter_insert_anyone" ON public.newsletter_subscribers;

-- Create new INSERT policy: Anyone can subscribe (no SELECT allowed)
CREATE POLICY "newsletter_insert_anon" ON public.newsletter_subscribers 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (true);

-- Explicitly deny SELECT to everyone except service_role
CREATE POLICY "newsletter_select_service_role_only" ON public.newsletter_subscribers 
  FOR SELECT TO service_role 
  USING (true);

-- Remove any anonymous/authenticated SELECT access
REVOKE SELECT ON public.newsletter_subscribers FROM anon;
REVOKE SELECT ON public.newsletter_subscribers FROM authenticated;