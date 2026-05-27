
DROP POLICY IF EXISTS newsletter_insert_anyone ON public.newsletter_subscribers;
CREATE POLICY newsletter_insert_valid ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 5 AND 254
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );
