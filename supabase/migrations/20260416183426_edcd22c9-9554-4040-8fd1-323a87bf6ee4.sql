-- Validação de status via trigger (CHECK constraints podem causar problemas em restorações)
CREATE OR REPLACE FUNCTION public.validate_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'aguardando_confirmacao', 'paid', 'overdue') THEN
    RAISE EXCEPTION 'Status inválido: %. Use pending, aguardando_confirmacao, paid ou overdue.', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_payment_status_trigger ON public.payments;
CREATE TRIGGER validate_payment_status_trigger
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.validate_payment_status();

-- Permitir que o usuário marque seu próprio pagamento como aguardando_confirmacao
DROP POLICY IF EXISTS "Users can mark own payment as awaiting" ON public.payments;
CREATE POLICY "Users can mark own payment as awaiting"
ON public.payments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status IN ('pending', 'overdue'))
WITH CHECK (user_id = auth.uid() AND status = 'aguardando_confirmacao');