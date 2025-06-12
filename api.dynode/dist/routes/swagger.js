"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// --- Swagger JSDoc configuration ---
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Dynode API with MongoDB",
            version: "1.0.0",
            description: "A simple Express API for retrieving data from MongoDB, documented with Swagger.",
        },
        servers: [
            {
                url: "https://localhost:3000",
                description: "Development server",
            },
            { url: "http://localhost:3000", description: "Dev HTTP" },
        ],
    },
    apis: ["./routes/data/creatives.ts", "./routes/files/media.ts"], // Update to .ts if you rename files
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const router = express_1.default.Router();
router.use("/", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
exports.default = router;
