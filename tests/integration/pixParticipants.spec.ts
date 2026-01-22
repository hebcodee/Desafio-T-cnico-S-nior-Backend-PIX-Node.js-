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

        const res = await request(app).get("/pix/participants/00416968");
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
        const res = await request(app).get("/pix/participants/ABC");
        expect(res.status).toBe(400);
    });
});
