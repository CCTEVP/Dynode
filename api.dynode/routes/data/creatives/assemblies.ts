import express, { Request, Response, NextFunction } from "express";
import logger from "../../../services/logger";
import CreativeAssembly from "../../../models/CreativeAssembly"; // Import the model

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatives = await CreativeAssembly.find({});
    res.json(creatives);
  } catch (error) {
    console.error("Error fetching creatives from MongoDB view:", error);
    res.status(500).json({ message: "Failed to retrieve creatives." });
  }
});
router.get(
  "/:id/package",
  async (req: Request, res: Response, next: NextFunction) => {
    const creativeId = req.params.id;
    try {
      const creatives = await CreativeAssembly.find({});
      res.json(creatives);
    } catch (error) {
      logger.error("Error fetching creative from MongoDB view:", error);
      res.status(500).json({ message: "Failed to retrieve creative." });
    }
  }
);
router.post(
  "/:id/package",
  async (req: Request, res: Response, next: NextFunction) => {
    const creativeId = req.params.id;
    try {
      const creatives = await CreativeAssembly.find({});
      res.json(creatives);
    } catch (error) {
      logger.error("Error packing creative:", error);
      res.status(500).json({ message: "Failed to retrieve creatives." });
    }
  }
);
export default router;
