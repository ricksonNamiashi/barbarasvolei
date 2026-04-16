
CREATE OR REPLACE FUNCTION public.notify_user_payment_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paid'
     AND (OLD.status IS DISTINCT FROM 'paid') THEN

    INSERT INTO public.notifications (user_id, title, message, type, payment_id)
    VALUES (
      NEW.user_id,
      'Pagamento confirmado',
      'Sua mensalidade de ' || NEW.month
        || ' (R$ ' || to_char(NEW.amount, 'FM999G990D00') || ') foi confirmada. Obrigado!',
      'payment_confirmed',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_user_payment_confirmed_trigger ON public.payments;
CREATE TRIGGER notify_user_payment_confirmed_trigger
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_payment_confirmed();
