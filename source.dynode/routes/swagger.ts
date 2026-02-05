import express, { Router } from "express";
//import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../openapi.json"; // Import your OpenAPI JSON file if you have one
import config from "../config";

// --- Swagger JSDoc configuration ---
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Source API",
      version: "1.0.0",
      description:
        "A simple Express API for retrieving data from MongoDB, documented with Swagger.",
    },
    servers: (() => {
      // Preserve two entries (HTTP + HTTPS) but derive host from central config.
      const base = (
        config.externalOrigins.source || "http://localhost:3333"
      ).trim();
      // Normalize to ensure we can swap protocol without duplicating path segments.
      const httpUrl = base.replace(/^https:/i, "http:");
      const httpsUrl = base.replace(/^http:/i, "https:");
      return [
        { url: httpUrl, description: "Dev HTTP" },
        { url: httpsUrl, description: "Secured server" },
      ];
    })(),
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
router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    // Use the project favicon for Swagger UI
    customfavIcon: "/images/logo.svg",
    customSiteTitle: swaggerDocument.info?.title ?? "Source API",
    customCss: ".swagger-ui .topbar { display: none; }",
    swaggerOptions: {
      url: "/openapi.json",
    },
  })
);

export default router;
