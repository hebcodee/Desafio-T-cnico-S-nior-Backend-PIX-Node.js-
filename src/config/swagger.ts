import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PIX Participants API",
            version: "1.0.0",
            description: "API para consulta de participantes PIX por ISPB"
        }
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"]
});
