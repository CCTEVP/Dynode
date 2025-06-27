import express, { Request, Response, NextFunction } from "express";
import logger from "../../../services/logger";
import CreativeAssembly from "../../../models/views/CreativeAssemblyView"; // Import the model

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
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creativeId = req.params.id;
    const creativeData = req.body;
    if (!creativeData.id) {
      res.status(400).json({ message: "Creative ID is required." });
      return;
    }
    if (!creativeData || Object.keys(creativeData).length === 0) {
      res.status(400).json({ message: "No Creative data to update." });
      return;
    }

    // Create or update the creative in the database
    const creative = await CreativeAssembly.findOneAndUpdate(
      { _id: creativeId },
      { $set: { creativeData } },
      { upsert: true, new: true }
    );
    res.json(creative);
  } catch (error) {
    console.error("Error saving assembly creative MongoDB collection:", error);
    res.status(500).json({ message: "Failed to save assembly creative." });
  }
});

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
