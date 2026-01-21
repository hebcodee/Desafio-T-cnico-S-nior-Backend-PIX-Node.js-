import { fetchParticipantsFromPdf, PixParticipant } from "../clients/bcbParticipants.client";
import {resolvePdfUrl} from "../utils/resolvePdfUrl";


export class PixParticipantsService {

    private participantsMap: Map<string, PixParticipant> | null = null;
    private loadedAt: Date | null = null;

    // CONSULTA PÚBLICA
    async findByIspb(ispb: string): Promise<PixParticipant | null> {
        console.log("========================================");
        console.log("[PIX-SERVICE] 🔎 Consulta iniciada");
        console.log("[PIX-SERVICE] ISPB:", ispb);
        console.log("========================================");

        if (!this.participantsMap) {
            console.log("[PIX-SERVICE] Cache vazio → iniciando carga");
            await this.loadOnce();
        }

        const found = this.participantsMap!.get(ispb);

        if (found) {
            console.log("[PIX-SERVICE] ✅ ISPB encontrado:", found);
        } else {
            console.warn("[PIX-SERVICE] ⚠️ ISPB NÃO encontrado:", ispb);
        }

        console.log("========================================");
        return found ?? null;
    }

    // CARGA ÚNICA DO PDF
    private async loadOnce(): Promise<void> {
        console.log("========================================");
        console.log("[PIX-SERVICE] 🚀 Iniciando carga do PDF");
        console.log("[PIX-SERVICE] Data início:", new Date().toISOString());
        console.log("========================================");

        try {
            const pdfUrl = await resolvePdfUrl();

            console.log("[PIX-SERVICE] 📄 PDF selecionado:");
            console.log("→", pdfUrl);

            const participants = await fetchParticipantsFromPdf(pdfUrl);

            console.log("[PIX-SERVICE] 📊 Total de registros extraídos:", participants.length);

            const map = new Map<string, PixParticipant>();

            for (const p of participants) {
                console.log("[PIX-SERVICE] ➕ Inserindo participante:", p);
                map.set(p.ispb, p);
            }

            this.participantsMap = map;
            this.loadedAt = new Date();

            console.log("========================================");
            console.log("[PIX-SERVICE] ✅ Cache carregado com sucesso");
            console.log("[PIX-SERVICE] Total em memória:", map.size);
            console.log("[PIX-SERVICE] Data carga:", this.loadedAt.toISOString());
            console.log("========================================");

        } catch (error: any) {
            console.error("========================================");
            console.error("[PIX-SERVICE] ❌ ERRO AO CARREGAR PDF");
            console.error("Message:", error?.message);
            console.error("Stack:", error?.stack);
            console.error("========================================");
            throw error;
        }
    }
}
