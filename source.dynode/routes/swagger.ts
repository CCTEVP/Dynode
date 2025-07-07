import express, { Router } from "express";
//import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../openapi.json"; // Import your OpenAPI JSON file if you have one

// --- Swagger JSDoc configuration ---
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dynode API with MongoDB",
      version: "1.0.0",
      description:
        "A simple Express API for retrieving data from MongoDB, documented with Swagger.",
    },
    servers: [
      { url: "https://localhost:3000", description: "Development server" },
      { url: "http://localhost:3000", description: "Dev HTTP" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./routes/login.ts",
    "./routes/data/creatives.ts",
    "./routes/files/media.ts",
  ], // Update to .ts if you rename files
};

//const swaggerSpec = swaggerJsdoc(options);

const router: Router = express.Router();

//router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
