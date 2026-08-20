DROP POLICY "First signed-in user can claim admin" ON public.user_roles;
REVOKE INSERT ON public.user_roles FROM authenticated;