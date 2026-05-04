/**
 * Helpers para lidar com o "mês de referência" das mensalidades de forma
 * segura contra fuso horário.
 *
 * Problema clássico: `new Date("2026-03-01")` no JS é interpretado como UTC,
 * o que vira `28/02/2026` no horário de Brasília (UTC-3). Isso causa
 * mensalidades cadastradas no mês errado e duplicatas que escapam à
 * verificação porque a string do mês difere por acentuação/maiúsculas.
 *
 * Tudo aqui assume o fuso `America/Sao_Paulo`, que é o fuso oficial da
 * escola.
 */

export const SCHOOL_TIMEZONE = "America/Sao_Paulo";

const MONTH_NAMES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/**
 * Converte uma data ISO (`YYYY-MM-DD`, vinda de um <input type="date">) em
 * um objeto `{ year, month }` interpretando os números literalmente — sem
 * passar por `new Date(string)`, que aplicaria UTC.
 */
const parseLocalISODate = (iso: string): { year: number; month: number; day: number } | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
};

/**
 * Devolve o rótulo canônico do mês (ex.: "Março 2026") a partir de uma
 * data de vencimento `YYYY-MM-DD`. Retorna `null` se a data for inválida.
 *
 * Esta função é a ÚNICA fonte de verdade para gerar a string `month` que
 * vai para o banco — garante consistência e evita duplicatas por
 * variação de capitalização/acentos.
 */
export const monthFromDueDate = (dueDateISO: string): string | null => {
  const parsed = parseLocalISODate(dueDateISO);
  if (!parsed) return null;
  return `${MONTH_NAMES_PT[parsed.month - 1]} ${parsed.year}`;
};

/**
 * Chave de comparação tolerante: remove acentos, espaços extras e
 * caixa. Usada para comparar a string `month` digitada/armazenada com
 * registros antigos no banco que podem estar em formato diferente.
 */
export const normalizeMonthKey = (input: string): string => {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Devolve o mês "agora" no fuso da escola — útil para defaults de UI sem
 * sofrer com servidor/cliente em fusos diferentes.
 */
export const currentSchoolMonth = (): string => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA gera YYYY-MM-DD
  const iso = fmt.format(new Date());
  return monthFromDueDate(iso) ?? "";
};
