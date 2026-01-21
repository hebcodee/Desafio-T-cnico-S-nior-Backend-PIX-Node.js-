import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { pixRoutes } from "./routes/pix.routes";

export const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(pixRoutes);

app.use((_req, res) => {
    res.status(404).json({ message: "Not Found" });
});
