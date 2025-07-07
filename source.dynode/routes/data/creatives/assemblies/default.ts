import express, { Request, Response, NextFunction } from "express";
import logger from "../../../../services/logger";
import CreativeAssemblyView from "../../../../models/views/CreativeAssemblyView";
import CreativeAssemblyCollection from "../../../../models/collections/CreativeAssemblyCollection";

const router = express.Router();

// GET all creatives
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const withChildren = req.query.children === "true";
  try {
    let result;
    if (withChildren) {
      result = await CreativeAssemblyView.find({});
    } else {
      result = await CreativeAssemblyCollection.find({});
    }
    res.json(result);
  } catch (error) {
    logger.error("Error fetching creatives:", error);
    res.status(500).json({ message: "Failed to retrieve creatives." });
  }
});

// GET single creative by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const creativeId = req.params.id;
  const withChildren = req.query.children === "true";
  try {
    let result;
    if (withChildren) {
      result = await CreativeAssemblyView.findById(creativeId);
    } else {
      result = await CreativeAssemblyCollection.findById(creativeId);
    }
    if (!result) {
      res.status(404).json({ message: "Creative not found." });
      return;
    }
    res.json(result);
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

    // Create or update the creative in the database
      const creative = await CreativeAssemblyView.findOneAndUpdate(
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
  "/package/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const creativeId = req.params.id;
    try {
        const creatives = await CreativeAssemblyView.find({});
      res.json(creatives);
    } catch (error) {
      logger.error("Error packing creative:", error);
      res.status(500).json({ message: "Failed to retrieve creatives." });
    }
  }
);


export default router;
