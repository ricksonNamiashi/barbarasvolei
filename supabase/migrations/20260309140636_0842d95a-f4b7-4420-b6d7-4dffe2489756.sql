
-- Drop the overly permissive SELECT policy on students
DROP POLICY IF EXISTS "Anyone can view students" ON public.students;

-- Create a scoped policy: only admins can view all students
CREATE POLICY "Only admins can view students"
  ON public.students FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
