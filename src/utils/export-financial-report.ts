import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PaymentRow {
  profile_name?: string;
  month: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
}

const statusLabel: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// ── CSV ──────────────────────────────────────────────
export function exportCSV(payments: PaymentRow[]) {
  const header = ["Aluno", "Mês", "Valor", "Vencimento", "Data Pgto", "Status"];
  const rows = payments.map((p) => [
    p.profile_name ?? "—",
    p.month,
    formatCurrency(p.amount),
    p.due_date,
    p.paid_date ?? "—",
    statusLabel[p.status] ?? p.status,
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `relatorio-financeiro-${dateStamp()}.csv`);
}

// ── PDF ──────────────────────────────────────────────
export function exportPDF(
  payments: PaymentRow[],
  summary: { totalReceived: number; totalPending: number; overdueTotal: number; delinquencyRate: number }
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text("Relatório Financeiro — ABV Vôlei", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);

  // Summary cards
  doc.setFontSize(11);
  doc.setTextColor(40);
  const summaryY = 38;
  doc.text(`Recebido: ${formatCurrency(summary.totalReceived)}`, 14, summaryY);
  doc.text(`A receber: ${formatCurrency(summary.totalPending)}`, 80, summaryY);
  doc.text(`Atrasado: ${formatCurrency(summary.overdueTotal)}`, 140, summaryY);
  doc.text(`Inadimplência: ${summary.delinquencyRate.toFixed(1)}%`, 14, summaryY + 7);

  // Table
  autoTable(doc, {
    startY: summaryY + 14,
    head: [["Aluno", "Mês", "Valor", "Vencimento", "Data Pgto", "Status"]],
    body: payments.map((p) => [
      p.profile_name ?? "—",
      p.month,
      formatCurrency(p.amount),
      p.due_date,
      p.paid_date ?? "—",
      statusLabel[p.status] ?? p.status,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [234, 88, 12] }, // orange-600
  });

  doc.save(`relatorio-financeiro-${dateStamp()}.pdf`);
}

// ── Helpers ──────────────────────────────────────────
function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
