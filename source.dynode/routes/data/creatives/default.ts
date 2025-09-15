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

    // Accept ?folder=value or repeated ?folder=a&folder=b
    if (typeof rawFolder === "string") {
      const f = rawFolder.trim();
      if (f) {
        if (!Types.ObjectId.isValid(f)) {
          res.status(400).json({ message: "Invalid folder id" });
          return;
        }
        filter.folder = new Types.ObjectId(f);
      }
    } else if (Array.isArray(rawFolder) && rawFolder.length) {
      const values = rawFolder
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean);
      const validObjectIds = values
        .filter(Types.ObjectId.isValid)
        .map((v) => new Types.ObjectId(v));
      if (!validObjectIds.length) {
        res.status(400).json({ message: "No valid folder ids provided" });
        return;
      }
      filter.folder = { $in: validObjectIds };
    }

    // Accept optional ?origin=value or repeated ?origin=a&origin=b
    // Behavior:
    // - no origin param provided -> apply origin = 'dynamics'
    // - origin=all (case-insensitive) -> do not filter by origin
    // - origin=a -> filter.origin = 'a'
    // - origin=a&origin=b -> filter.origin = { $in: ['a','b'] }
    if (typeof rawOrigin === "undefined") {
      filter.origin = "dynamics";
    } else if (typeof rawOrigin === "string") {
      const o = rawOrigin.trim();
      if (o && o.toLowerCase() !== "all") filter.origin = o;
    } else if (Array.isArray(rawOrigin) && rawOrigin.length) {
      const values = rawOrigin
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean);
      const lower = values.map((s) => s.toLowerCase());
      if (values.length && !lower.includes("all")) {
        filter.origin = { $in: values };
      }
    }

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
