CREATE POLICY "First signed-in user can claim admin" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'
    AND NOT EXISTS (SELECT 1 FROM public.user_roles existing WHERE existing.role = 'admin')
  );
GRANT INSERT ON public.user_roles TO authenticated;