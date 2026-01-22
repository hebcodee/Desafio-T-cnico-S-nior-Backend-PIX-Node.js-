import { Request, Response } from "express";
import { normalizeIspb } from "../utils/normalizeIspb";
import {PixParticipantsService} from "../services/pixParticipants.service";




const service = new PixParticipantsService();

/**
 * @openapi
 * /pix/participants/{ispb}:
 *   get:
 *     summary: Consulta participante PIX por ISPB
 *     description: |
 *       Retorna os dados do participante PIX correspondente ao ISPB informado.
 *
 *       O ISPB deve conter até 8 dígitos numéricos e pode possuir zeros à esquerda.
 *       O valor é normalizado internamente para sempre possuir 8 dígitos.
 *
 *       Exemplo:
 *       - Entrada: `416968`
 *       - Normalizado: `00416968`
 *
 *     tags:
 *       - PIX
 *
 *     parameters:
 *       - in: path
 *         name: ispb
 *         required: true
 *         description: ISPB da instituição (8 dígitos numéricos)
 *         schema:
 *           type: string
 *           example: "00416968"
 *
 *     responses:
 *       200:
 *         description: Participante encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nomeReduzido:
 *                   type: string
 *                   example: "BANCO INTER"
 *                 ispb:
 *                   type: string
 *                   example: "00416968"
 *                 cnpj:
 *                   type: string
 *                   example: "00000000000100"
 *
 *       400:
 *         description: ISPB inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ISPB inválido: deve conter apenas dígitos (até 8)"
 *
 *       404:
 *         description: Participante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Participante não encontrado"
 *                 ispb:
 *                   type: string
 *                   example: "00416968"
 *
 *       502:
 *         description: Falha ao consultar fonte externa (BCB)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Falha ao consultar fonte do BCB"
 *                 details:
 *                   type: string
 *                   example: "Timeout ou erro HTTP"
 */
export async function getParticipantByIspb(req: Request, res: Response) {
    let ispb: string;

    try {
        ispb = normalizeIspb(req.params.ispb);
    } catch (e: any) {
        return res.status(400).json({
            message: e?.message ?? "ISPB inválido"
        });
    }

    try {
        const found = await service.findByIspb(ispb);

        if (!found) {
            return res.status(404).json({
                message: "Participante não encontrado",
                ispb
            });
        }

        return res.json(found);
        
    } catch (e: any) {
        return res.status(404).json({
            message: "Participante não encontrado",
            details: e?.message
        });
    }
}
