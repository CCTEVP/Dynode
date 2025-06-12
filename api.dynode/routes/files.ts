import express, { Request, Response, NextFunction } from "express";
const router = express.Router();

import mediaRouter from "./files/media";
router.use("/media", mediaRouter);

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.json({
    message: "Try /files/media",
  });
});

export default router;
