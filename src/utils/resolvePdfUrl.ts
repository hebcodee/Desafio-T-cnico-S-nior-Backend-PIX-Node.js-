import axios from "axios";

function buildPdfUrl(date: string) {
    return `https://www.bcb.gov.br/content/estabilidadefinanceira/participantes_pix_pdf/lista-participantes-instituicoes-em-adesao-pix-${date}.pdf`;
}

function formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}

export async function resolvePdfUrl(): Promise<string> {
    console.log("========================================");
    console.log("[PDF-RESOLVER] 🔎 Procurando PDF válido");
    console.log("[PDF-RESOLVER] Data container:", new Date().toISOString());
    console.log("========================================");

    for (let i = 1; i <= 5; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);

        const dateStr = formatDate(d);
        const url = buildPdfUrl(dateStr);

        console.log("----------------------------------------");
        console.log("[PDF-RESOLVER] Tentando data:", dateStr);
        console.log("[PDF-RESOLVER] URL:", url);

        try {
            const head = await axios.head(url, { timeout: 5000 });
            console.log("[PDF-RESOLVER] HTTP STATUS:", head.status);
            console.log("[PDF-RESOLVER] ✅ PDF válido encontrado:", dateStr);
            console.log("----------------------------------------");
            return url;
        } catch (err: any) {
            console.warn("[PDF-RESOLVER] ❌ Não encontrado:", dateStr);
        }
    }

    throw new Error("Nenhum PDF válido encontrado nos últimos dias");
}
