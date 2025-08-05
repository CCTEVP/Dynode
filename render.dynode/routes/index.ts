import express, { Request, Response, NextFunction } from "express";
import logger from "../services/logger";
import dynamicsRouter from "./dynamics/default";

const router = express.Router();
router.use("/dynamics", dynamicsRouter);

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  logger.info(`Index loaded RENDER`);
  res.render("index", { title: "Express" });
});

export default router;
