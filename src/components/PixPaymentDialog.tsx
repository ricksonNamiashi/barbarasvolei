import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { generatePixPayload, PIX_DISPLAY } from "@/lib/pix";
import type { Payment } from "@/hooks/use-payments";

interface PixPaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const PixPaymentDialog = ({ payment, open, onOpenChange }: PixPaymentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [payload, setPayload] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!payment || !open) return;
    const code = generatePixPayload({
      amount: Number(payment.amount),
      txid: payment.id.replace(/-/g, "").slice(0, 25),
    });
    setPayload(code);
    QRCode.toDataURL(code, { width: 280, margin: 1, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [payment, open]);

  const handleCopy = async (text: string, type: "key" | "payload") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "key") {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedPayload(true);
        setTimeout(() => setCopiedPayload(false), 2000);
      }
      toast({ title: "Copiado!" });
    } catch {
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  };

  const handleAlreadyPaid = async () => {
    if (!payment) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("payments")
        .update({ status: "aguardando_confirmacao" })
        .eq("id", payment.id);
      if (error) throw error;
      toast({
        title: "Pagamento informado!",
        description: "Aguardando confirmação do administrador.",
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao informar pagamento",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Pagar com Pix</DialogTitle>
          <DialogDescription>
            {payment.month} · {formatCurrency(Number(payment.amount))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* QR Code */}
          <div className="flex justify-center rounded-xl bg-white p-3">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code Pix" className="h-56 w-56" />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Pix Key */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Chave Pix ({PIX_DISPLAY.keyType})
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="font-mono text-sm font-semibold text-foreground">
                {PIX_DISPLAY.key}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs"
                onClick={() => handleCopy(PIX_DISPLAY.rawKey, "key")}
              >
                {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Pix Copia e Cola */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleCopy(payload, "payload")}
            disabled={!payload}
          >
            {copiedPayload ? <Check size={16} /> : <Copy size={16} />}
            {copiedPayload ? "Código copiado!" : "Copiar Pix Copia e Cola"}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Após pagar no app do seu banco, toque em <strong>Já paguei</strong> para
            avisar a escola. O administrador confirmará o recebimento.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button size="sm" onClick={handleAlreadyPaid} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Já paguei"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
