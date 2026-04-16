
ALTER POLICY "Admins can manage notifications" ON public.notifications TO authenticated;
ALTER POLICY "Users can update own notifications" ON public.notifications TO authenticated;
ALTER POLICY "Users can view own notifications" ON public.notifications TO authenticated;
