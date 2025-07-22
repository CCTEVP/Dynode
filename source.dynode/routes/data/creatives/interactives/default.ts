import express, { Request, Response, NextFunction } from "express";
import logger from "../../../../services/logger";
import scrapper from "../../../../services/scrapper";
import CreativeInteractiveView from "../../../../models/views/CreativeInteractiveView";
import CreativeInteractiveCollection from "../../../../models/collections/CreativeInteractiveCollection";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const withChildren = req.query.children === "true";
    let creatives;
    if (withChildren) {
      creatives = await CreativeInteractiveView.find({});
    } else {
      creatives = await CreativeInteractiveCollection.find({});
    }
    res.json(creatives);
    res.json(creatives);
  } catch (error) {
    console.error("Error fetching creatives from MongoDB view:", error);
    res.status(500).json({ message: "Failed to retrieve creatives." });
  }
});
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const creativeId = req.params.id;
  const withChildren = req.query.children === "true";
  try {
    let creative;
    if (withChildren) {
      creative = await CreativeInteractiveView.findById(creativeId);
    } else {
      creative = await CreativeInteractiveCollection.findById(creativeId);
    }
    if (!creative) {
      res.status(404).json({ message: "Creative not found." });
      return;
    }
    res.json(creative);
  } catch (error) {
    logger.error("Error fetching creative:", error);
    res.status(500).json({ message: "Failed to retrieve creative." });
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const editorUserId = req.user?.userId || "000000000000000000000000"; // The logged-in user making the change
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
    // Scrape components, animations, assets
    const { components, libraries, assets } = await scrapper.getComponents(
      creativeId,
      creativeData
    );

    // Prepare resources object
    const now = new Date();
    const resources = {
      created: now,
      updated: now,
      components,
      libraries,
      assets,
    };

    // Inject resources into creativeData
    creativeData.resources = resources;

    // update the creative in the database
    const creative = await CreativeInteractiveCollection.findOneAndUpdate(
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
