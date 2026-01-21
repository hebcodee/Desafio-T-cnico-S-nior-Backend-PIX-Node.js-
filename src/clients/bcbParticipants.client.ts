import axios from "axios";
import pdfParse from "pdf-parse";

export interface PixParticipant {
    nomeReduzido: string;
    ispb: string;
    cnpj: string;
}

export async function fetchParticipantsFromPdf(
    pdfUrl: string
): Promise<PixParticipant[]> {

    console.log("====================================================");
    console.log("[BCB-CLIENT] 🌐 Baixando PDF");
    console.log("[BCB-CLIENT] URL:", pdfUrl);
    console.log("====================================================");

    const response = await axios.get<ArrayBuffer>(pdfUrl, {
        responseType: "arraybuffer",
        timeout: 15000
    });

    console.log("[BCB-CLIENT] HTTP STATUS:", response.status);
    console.log("[BCB-CLIENT] Bytes:", response.data.byteLength);

    const buffer = Buffer.from(response.data);

    console.log("[BCB-CLIENT] 🧠 Iniciando parse do PDF...");

    const parsed = await pdfParse(buffer);
    const text = parsed.text ?? "";

    console.log("----------------------------------------------------");
    console.log("[BCB-CLIENT] 📄 INÍCIO DO TEXTO EXTRAÍDO (800 chars)");
    console.log(text.substring(0, 800));
    console.log("[BCB-CLIENT] 📄 FIM DO TEXTO EXTRAÍDO");
    console.log("----------------------------------------------------");

    const participants = parseParticipantsFromText(text);

    console.log("[BCB-CLIENT] ✅ Total participantes parseados:", participants.length);

    return participants;
}

// PARSER DO TEXTO
function parseParticipantsFromText(text: string): PixParticipant[] {
    const participants: PixParticipant[] = [];

    const lines = text
        .split("\n")
        .map(l => l.replace(/\s+/g, " ").trim())
        .filter(Boolean);

    console.log("[BCB-CLIENT] 🔍 Total de linhas para análise:", lines.length);

    for (let i = 0; i < lines.length; i++) {
        const current = lines[i];

        // ISPB = exatamente 8 dígitos
        if (!/^\d{8}$/.test(current)) {
            continue;
        }

        const ispb = current;

        const nome = lines[i - 1] ?? "";
        const rawCnpj = lines[i + 1] ?? "";

        // Remove tudo que não é número do CNPJ
        const cnpj = rawCnpj.replace(/\D/g, "");


        const participant: PixParticipant = {
            nomeReduzido: nome,
            ispb,
            cnpj
        };

        console.log("[BCB-CLIENT] ➕ Registro encontrado:", participant);
        participants.push(participant);
    }

    console.log("[BCB-CLIENT] ✅ Total participantes parseados:", participants.length);
    return participants;
}

