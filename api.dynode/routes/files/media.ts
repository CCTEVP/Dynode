import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Test route for media files." });
});

export default router;
