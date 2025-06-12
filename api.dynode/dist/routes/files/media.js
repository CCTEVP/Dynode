"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
/**
 * @swagger
 * /files/media:
 *   get:
 *     summary: A test endpoint under /files/media.
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Test successful.
 */
router.get("/", (req, res, next) => {
    res.json({ message: "Test route for media files." });
});
exports.default = router;
