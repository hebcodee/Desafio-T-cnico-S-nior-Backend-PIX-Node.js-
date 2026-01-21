import { normalizeIspb } from "../../src/utils/normalizeIspb";

describe("normalizeIspb", () => {
    it("padStart para 8 dígitos", () => {
        expect(normalizeIspb("416968")).toBe("00416968");
    });

    it("mantém 8 dígitos", () => {
        expect(normalizeIspb("00416968")).toBe("00416968");
    });

    it("aceita espaços e normaliza", () => {
        expect(normalizeIspb("  123  ")).toBe("00000123");
    });

    it("rejeita letras", () => {
        expect(() => normalizeIspb("00A16968")).toThrow();
    });

    it("rejeita mais de 8 dígitos", () => {
        expect(() => normalizeIspb("123456789")).toThrow();
    });
});
