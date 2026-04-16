import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Loader2, Paperclip, X, FileImage } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { generatePixPayload, PIX_DISPLAY } from "@/lib/pix";
import type { Payment } from "@/hooks/use-payments";

interface PixPaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

export const PixPaymentDialog = ({ payment, open, onOpenChange }: PixPaymentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [payload, setPayload] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  useEffect(() => {
    if (!payment || !open) return;
    setReceipt(null);
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

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: "Formato não suportado",
        description: "Envie PNG, JPG, WEBP ou PDF.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      toast({
        title: "Arquivo muito grande",
        description: "Tamanho máximo: 5MB.",
        variant: "destructive",
      });
      return;
    }
    setReceipt(file);
  };

  const uploadReceipt = async (file: File): Promise<string> => {
    if (!user || !payment) throw new Error("Sessão inválida");
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${user.id}/${payment.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("payment-receipts")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    return path;
  };

  const handleAlreadyPaid = async () => {
    if (!payment) return;
    setSubmitting(true);
    try {
      let receiptPath: string | null = null;
      if (receipt) {
        receiptPath = await uploadReceipt(receipt);
      }

      const update: { status: string; receipt_url?: string } = {
        status: "aguardando_confirmacao",
      };
      if (receiptPath) update.receipt_url = receiptPath;

      const { error } = await supabase
        .from("payments")
        .update(update)
        .eq("id", payment.id);
      if (error) throw error;

      toast({
        title: "Pagamento informado!",
        description: receipt
          ? "Comprovante enviado. Aguardando confirmação do administrador."
          : "Aguardando confirmação do administrador.",
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
      <DialogContent className="max-w-[360px] max-h-[90vh] overflow-y-auto">
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

          {/* Comprovante */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Comprovante (opcional)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
              onChange={handleFilePick}
            />
            {receipt ? (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
                <FileImage size={18} className="shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{receipt.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(receipt.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setReceipt(null)}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={14} />
                Anexar comprovante
              </Button>
            )}
            <p className="text-[10px] text-muted-foreground">
              PNG, JPG, WEBP ou PDF · até 5MB
            </p>
          </div>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Após pagar no app do seu banco, toque em <strong>Já paguei</strong> para
            avisar a escola. O administrador confirmará o recebimento.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
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
