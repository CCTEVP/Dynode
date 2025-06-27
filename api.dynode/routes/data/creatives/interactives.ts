import express, { Request, Response, NextFunction } from "express";
import logger from "../../../services/logger";
import CreativeInteractive from "../../../models/views/CreativeInteractiveView"; // Import the model

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
    const creative = await CreativeInteractive.findOneAndUpdate(
      { _id: creativeId },
      { $set: { creativeData } },
      { upsert: true, new: true }
    );
    res.json(creative);
  } catch (error) {
    console.error(
      "Error saving interactive creative MongoDB collection:",
      error
    );
    res.status(500).json({ message: "Failed to save interactive creative." });
  }
});
export default router;
