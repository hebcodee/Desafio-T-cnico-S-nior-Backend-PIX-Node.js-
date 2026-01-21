export function normalizeIspb(raw: string): string {
    const cleaned = (raw ?? "").trim();

    // aceita 1..8 dígitos e normaliza para 8 com zero à esquerda
    if (!/^\d{1,8}$/.test(cleaned)) {
        throw new Error("ISPB inválido: deve conter apenas dígitos (até 8)");
    }

    return cleaned.padStart(8, "0");
}
