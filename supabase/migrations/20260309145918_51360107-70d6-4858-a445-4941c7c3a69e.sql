-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- === NOTIFICATIONS ===
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Admins can manage notifications" ON public.notifications
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO public
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- === SCHEDULES ===
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.schedules;
DROP POLICY IF EXISTS "Anyone can view schedules" ON public.schedules;

CREATE POLICY "Admins can manage schedules" ON public.schedules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view schedules" ON public.schedules
  FOR SELECT TO authenticated
  USING (true);

-- === PROFILES ===
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- === USER_ROLES ===
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- === NOTICES ===
DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;
DROP POLICY IF EXISTS "Anyone can view notices" ON public.notices;

CREATE POLICY "Admins can manage notices" ON public.notices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view notices" ON public.notices
  FOR SELECT TO authenticated
  USING (true);

-- === STUDENTS ===
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Only admins can view students" ON public.students;

CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can view students" ON public.students
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- === PAYMENTS ===
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));