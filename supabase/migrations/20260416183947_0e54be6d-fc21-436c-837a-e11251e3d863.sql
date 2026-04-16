-- 1) Coluna para URL do comprovante na tabela payments
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS receipt_url text;

-- 2) Bucket privado de comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- 3) Policies do bucket: usuário acessa só sua pasta {user_id}/...
DROP POLICY IF EXISTS "Users upload own receipts" ON storage.objects;
CREATE POLICY "Users upload own receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users read own receipts" ON storage.objects;
CREATE POLICY "Users read own receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-receipts'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Users update own receipts" ON storage.objects;
CREATE POLICY "Users update own receipts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Admins delete receipts" ON storage.objects;
CREATE POLICY "Admins delete receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-receipts'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 4) Permitir o usuário gravar receipt_url ao marcar como aguardando_confirmacao
DROP POLICY IF EXISTS "Users can mark own payment as awaiting" ON public.payments;
CREATE POLICY "Users can mark own payment as awaiting"
ON public.payments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status IN ('pending', 'overdue'))
WITH CHECK (user_id = auth.uid() AND status = 'aguardando_confirmacao');

-- 5) Trigger: notificar admins quando um pagamento entra em aguardando_confirmacao
CREATE OR REPLACE FUNCTION public.notify_admins_pix_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payer_name text;
BEGIN
  IF NEW.status = 'aguardando_confirmacao'
     AND (OLD.status IS DISTINCT FROM 'aguardando_confirmacao') THEN

    SELECT name INTO payer_name FROM public.profiles WHERE id = NEW.user_id;

    INSERT INTO public.notifications (user_id, title, message, type, payment_id)
    SELECT
      ur.user_id,
      'Novo Pix para confirmar',
      COALESCE(payer_name, 'Um responsável') || ' informou pagamento de ' || NEW.month
        || ' (R$ ' || to_char(NEW.amount, 'FM999G990D00') || ')',
      'pix_review',
      NEW.id
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_admins_pix_review_trigger ON public.payments;
CREATE TRIGGER notify_admins_pix_review_trigger
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_pix_review();