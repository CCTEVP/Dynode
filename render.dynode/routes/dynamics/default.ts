import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
const router = express.Router();

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  logger.info(`Dynamics loaded`);
  res.render("Dynamic", { title: "Dynamic" });
});

export default router;
