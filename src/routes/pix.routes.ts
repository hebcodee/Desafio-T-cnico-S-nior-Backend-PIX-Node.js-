import { Router } from "express";
import { getParticipantByIspb } from "../controllers/pixParticipants.controller";

export const pixRoutes = Router();

pixRoutes.get("/pix/participants/:ispb", getParticipantByIspb);
