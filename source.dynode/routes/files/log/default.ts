import express from "express";
import logger from "../../../services/logger";
const router = express.Router();

const allowedLevels = ["info", "error", "warn", "debug"] as const;
type LogLevel = typeof allowedLevels[number];

router.post("/", (req, res) => {
    const { level, message, meta } = req.body;
    if (allowedLevels.includes(level)) {
        (logger as any)[level](message, meta);
    }
    res.sendStatus(204);
});

export default router;