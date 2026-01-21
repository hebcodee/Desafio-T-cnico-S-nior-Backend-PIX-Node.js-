import request from "supertest";

import * as client from "../../src/clients/bcbParticipants.client";
import {app} from "../../src/app";

jest.spyOn(client, "fetchParticipantsFromPdf").mockResolvedValue([
    { nomeReduzido: "Banco Integração", ispb: "00416968", cnpj: "11111111111111" }
]);

describe("GET /pix/participants/:ispb", () => {

    it("deve retornar 200 quando ISPB existir", async () => {
        const res = await request(app)
            .get("/pix/participants/416968") // sem zero à esquerda
            .expect(200);

        expect(res.body.ispb).toBe("00416968");
    });

    it("deve retornar 404 quando ISPB não existir", async () => {
        await request(app)
            .get("/pix/participants/99999999")
            .expect(404);
    });
    
    it("deve retornar 404 para rotas inexistentes", async () => {
    const response = await request(app)
      .get('/rota-que-nao-existe');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Not Found" });
    });

    it("não deve retornar 404 quando a rota existe", async () => {
    const response = await request(app)
      .get('/hello');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello" });
    });
    
});
