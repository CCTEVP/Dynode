import express, { Request, Response, NextFunction } from "express";
import logger from "../services/logger";
const router = express.Router();

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  logger.info(`Index loaded RENDER`);
  res.render("index", { title: "Express" });
});

export default router;
