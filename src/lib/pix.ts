// Gerador de BR Code (Pix EMVCo) — padrão Banco Central do Brasil
// Permite criar o "copia e cola" e o conteúdo do QR Code dinâmico com valor.

const PIX_KEY = "21966213552"; // Telefone (será normalizado para +5521966213552)
const MERCHANT_NAME = "ABV ESCOLA DE VOLEI";
const MERCHANT_CITY = "RIO DE JANEIRO";

// Normaliza telefone para o formato +55DDDNUMERO exigido pelo Pix
const normalizePhoneKey = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
};

// Formata um campo no padrão TLV (ID + tamanho 2 dígitos + valor)
const tlv = (id: string, value: string): string => {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
};

// CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) — usado pelo Pix
const crc16 = (payload: string): string => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const sanitize = (text: string, max: number): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);

export interface PixPayloadParams {
  amount: number;
  txid?: string; // identificador único da cobrança (até 25 chars alfanuméricos)
}

export const generatePixPayload = ({ amount, txid }: PixPayloadParams): string => {
  const merchantAccount = tlv("00", "br.gov.bcb.pix") + tlv("01", normalizePhoneKey(PIX_KEY));

  const additionalData = tlv("05", sanitize(txid ?? "***", 25) || "***");

  const payload =
    tlv("00", "01") + // Payload Format Indicator
    tlv("26", merchantAccount) + // Merchant Account Information (Pix)
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // Currency (BRL)
    tlv("54", amount.toFixed(2)) + // Transaction Amount
    tlv("58", "BR") + // Country Code
    tlv("59", sanitize(MERCHANT_NAME, 25)) + // Merchant Name
    tlv("60", sanitize(MERCHANT_CITY, 15)) + // Merchant City
    tlv("62", additionalData); // Additional Data Field (txid)

  const toHash = `${payload}6304`;
  return `${toHash}${crc16(toHash)}`;
};

export const PIX_DISPLAY = {
  key: "(21) 96621-3552",
  keyType: "Telefone",
  rawKey: PIX_KEY,
  merchantName: "ABV Escola de Vôlei",
};
