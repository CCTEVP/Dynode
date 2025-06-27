import express, { Request, Response, NextFunction } from "express";
import logger from "../../../services/logger";
import CreativeDynamicView from "../../../models/views/CreativeDynamicView";
import CreativeDynamicCollection from "../../../models/collections/CreativeDynamicCollection";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatives = await CreativeDynamicView.find({});
    res.json(creatives);
  } catch (error) {
    console.error("Error fetching creatives from MongoDB view:", error);
    res.status(500).json({ message: "Failed to retrieve creatives." });
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const creativeId = req.params.id;
  try {
    const creative = await CreativeDynamicView.findById(creativeId);
    if (!creative) {
      res.status(404).json({ message: "Creative not found." });
      return;
    }
    res.json(creative);
  } catch (error) {
    logger.error("Error fetching creative from MongoDB view:", error);
    res.status(500).json({ message: "Failed to retrieve creative." });
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creativeId = req.params.id;
    const creativeData = req.body;
    logger.info(
      `Updating dynamic creative with ID: ${creativeId}, Data: ${JSON.stringify(
        creativeData
      )}`
    );
    if (!creativeId) {
      res.status(400).json({ message: "Creative ID is required." });
      return;
    }
    if (!creativeData || Object.keys(creativeData).length === 0) {
      res.status(400).json({ message: "No Creative data to update." });
      return;
    }

    // Create or update the creative in the database
    const creative = await CreativeDynamicCollection.findOneAndUpdate(
      { _id: creativeId },
      { $set: creativeData },
      { upsert: true, new: true }
    );
    res.json(creative);
  } catch (error) {
    logger.error("Error saving dynamic creative MongoDB collection:", error);
    res.status(500).json({ message: "Failed to save dynamic creative." });
  }
});
export default router;
