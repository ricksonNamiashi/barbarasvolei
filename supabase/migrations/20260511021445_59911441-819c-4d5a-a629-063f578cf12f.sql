
CREATE POLICY "Responsavel can view own students"
ON public.students FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'responsavel')
  AND responsible = (SELECT name FROM public.profiles WHERE id = auth.uid())
);
