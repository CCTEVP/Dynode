import express, { Request, Response, NextFunction } from "express";
import logger from "../../../services/logger";
import CreativeInteractive from "../../../models/CreativeInteractive"; // Import the model

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatives = await CreativeInteractive.find({});
    res.json(creatives);
  } catch (error) {
    console.error("Error fetching creatives from MongoDB view:", error);
    res.status(500).json({ message: "Failed to retrieve creatives." });
  }
});
export default router;
