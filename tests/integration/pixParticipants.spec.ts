import request from "supertest";
import nock from "nock";
import { app } from "../../src/app";

describe("GET /pix/participants/:ispb (integration)", () => {
    const csvUrl = "https://example.com/ParticipantesPix.csv";

    beforeAll(() => {
        process.env.BCB_PIX_PARTICIPANTS_CSV_URL = csvUrl;
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it("retorna participante para ISPB com zero à esquerda (bug fix)", async () => {
        const csv =
            "Nome;ISPB;CNPJ\n" +
            "BANCO INTER;00416968;00000000000100\n" +
            "BANCO XYZ;13140088;00000000000200\n";

        nock("https://example.com").get("/ParticipantesPix.csv").reply(200, csv);

        const res = await request(app).get("/pix/participants/416968");
        expect(res.status).toBe(200);
        expect(res.body.ispb).toBe("00416968");
        expect(res.body.nomeReduzido).toContain("INTER");
    });

    it("normaliza ISPB curto e encontra (ex.: 416968 -> 00416968)", async () => {
        const csv =
            "Nome;ISPB;CNPJ\n" +
            "BANCO INTER;00416968;00000000000100\n";

        nock("https://example.com").get("/ParticipantesPix.csv").reply(200, csv);

        const res = await request(app).get("/pix/participants/416968");
        expect(res.status).toBe(200);
        expect(res.body.ispb).toBe("00416968");
    });

    it("retorna 404 quando não encontra Participante", async () => {
        const res = await request(app).get("/pix/participants/4451251");
        expect(res.status).toBe(404);
    });

    it("retorna 400 para ISPB inválido", async () => {
        const res = await request(app).get("/pix/participants/1234567678");
        expect(res.status).toBe(400);
    });

    it("retorna 400 para ISPB com letras", async () => {
        const res = await request(app).get("/pix/participants/00A16968");
        expect(res.status).toBe(400);
        expect(res.body.message).toContain("inválido");
    });

    it("retorna 400 para ISPB vazio", async () => {
        const res = await request(app).get("/pix/participants/");
        expect(res.status).toBe(404);
    });

    it("retorna 502 se falhar ao resolver PDF", async () => {
        // Mock todas as tentativas de PDF (últimos 5 dias) com erro
        nock("https://www.bcb.gov.br")
            .head(/\/content\/estabilidadefinanceira\/participantes_pix_pdf\/.*\.pdf/)
            .times(5)
            .reply(404);

        const res = await request(app).get("/pix/participants/00416968");
        expect(res.status).toBe(502);
        expect(res.body.message).toBe("Falha ao consultar fonte do BCB");
        expect(res.body.details).toContain("Nenhum PDF válido");
    });

    // it("retorna 404 quando ISPB não existe no CSV", async () => {
    //     const csv =
    //         "Nome;ISPB;CNPJ\n" +
    //         "BANCO XYZ;13140088;00000000000200\n";

    //     nock("https://www.bcb.gov.br")
    //         .head(/\/content\/estabilidadefinanceira\/participantes_pix_pdf\/.*\.pdf/)
    //         .reply(200);

    //     nock("https://www.bcb.gov.br")
    //         .get(/\/content\/estabilidadefinanceira\/participantes_pix_pdf\/.*\.pdf/)
    //         .reply(200, csv);

    //     const res = await request(app).get("/pix/participants/00416968");
    //     expect(res.status).toBe(404);
    //     expect(res.body.ispb).toBe("00416968");
    //     expect(res.body.message).toBe("Participante não encontrado");
    // });

    it("retorna múltiplos participantes corretamente do CSV", async () => {
        const csv =
            "Nome;ISPB;CNPJ\n" +
            "BANCO INTER;00416968;00000000000100\n" +
            "BANCO BRADESCO;00000001;00000000000200\n" +
            "BANCO SANTANDER;00033456;00000000000300\n";

        nock("https://www.bcb.gov.br")
            .head(/\/content\/estabilidadefinanceira\/participantes_pix_pdf\/.*\.pdf/)
            .reply(200);

        nock("https://www.bcb.gov.br")
            .get(/\/content\/estabilidadefinanceira\/participantes_pix_pdf\/.*\.pdf/)
            .reply(200, csv);

        // Testa cada participante
        let res = await request(app).get("/pix/participants/00416968");
        expect(res.status).toBe(200);

        res = await request(app).get("/pix/participants/00000000");
        expect(res.status).toBe(200);

        res = await request(app).get("/pix/participants/61186680");
        expect(res.status).toBe(200);
    });

    // it("retorna 502 com detalhes do erro quando PDF é inválido", async () => {
    //     nock("https://www.bcb.gov.br")
    //         .head(/\/content\/estabilidadefinanceira\/participantes_pix_pdf\/.*\.pdf/)
    //         .reply(200);

    //     nock("https://www.bcb.gov.br")
    //         .get(/\/content\/estabilidadefinanceira\/participantes_pix_pdf\/.*\.pdf/)
    //         .reply(200, "não é um PDF válido");

    //     const res = await request(app).get("/pix/participants/00416968");
    //     expect(res.status).toBe(502);
    //     expect(res.body.message).toBe("Falha ao consultar fonte do BCB");
    //     expect(res.body.details).toBeDefined();
    // });
});
