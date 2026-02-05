import express, { Request, Response, NextFunction } from "express";
const router = express.Router();

import assetsRouter from "./assets/default";
import logsRouter from "./log/default";

router.use("/assets", assetsRouter);
router.use("/log", logsRouter);
router.use("/logs", logsRouter); // Alias for backward compatibility with builder.dynode

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.json({
    message: "Try /files/media",
  });
});

export default router;
