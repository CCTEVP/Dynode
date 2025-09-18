import express, { Request, Response, NextFunction } from "express";
import logger from "../../../services/logger";
import assembliesRouter from "./assemblies/default";
import dynamicsRouter from "./dynamics/default";
import interactivesRouter from "./interactives/default";
import CreativeUnifiedView from "../../../models/views/CreativeUnifiedView";
import CreativeUnifiedViewElements from "../../../models/views/CreativeUnifiedViewElements";
import { Types } from "mongoose";

const router = express.Router();
// Mount sub-routers
router.use("/assemblies", assembliesRouter);
router.use("/dynamics", dynamicsRouter);
router.use("/interactives", interactivesRouter);

// List all creatives, include optional folder and origin parameters
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawFolder = req.query.folder;
    const rawOrigin = req.query.origin;
    const filter: any = {};

    // children defaults to false when not provided
    const children = req.query.children === "true";

    // NOTE: folder/origin query filtering removed - return all creatives matching other filters

    // Choose model based on children flag:
    // - children === true -> CreativeUnifiedViewElements (with children)
    // - children === false (or not provided) -> CreativeUnifiedView (no children)
    const Model = children ? CreativeUnifiedViewElements : CreativeUnifiedView;

    logger.info(
      `Using model: ${Model.modelName}, collection: ${Model.collection.name}`,
      { filter }
    );

    // Use lean() to return plain objects and let the view supply whatever fields it defines
    const creatives = await Model.find(filter).lean().exec();
    res.json(creatives);
  } catch (error) {
    logger.error("Error fetching creatives from MongoDB view:", error);
    res.status(500).json({ message: "Failed to retrieve creatives." });
  }
});

// Get creative by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const creativeId = req.params.id;
  console.log("Fetching creative with ID:", creativeId);
  try {
    const creative = await CreativeUnifiedViewElements.findById(
      creativeId
    ).exec();
    res.json(creative);
  } catch (error) {
    logger.error("Error fetching creative from MongoDB view:", error);
    res.status(500).json({
      message:
        "Creative route failed to retrieve creative with ID: " + creativeId,
    });
  }
});

export default router;
