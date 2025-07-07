import express, { Request, Response, NextFunction } from "express";
const router = express.Router();

import assetsRouter from "./assets/default";
import logsRouter from "./logs/default";
router.use("/assets", assetsRouter);
router.use("/logs", logsRouter);

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.json({
    message: "Try /files/media",
  });
});

export default router;
