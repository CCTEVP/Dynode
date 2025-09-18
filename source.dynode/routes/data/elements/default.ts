import express, { Request, Response, NextFunction } from "express";
import logger from "../../../services/logger";
import elementsCollection from "../../../models/collections/ElementsCollection";
import elementsAssetsView from "../../../models/views/ElementsAssetsView";
import elementsBindingView from "../../../models/views/ElementsBindingView";
import { Types } from "mongoose";

const router = express.Router();

// List all elements
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};

    const rawMode = req.query.mode;
    const mode = Array.isArray(rawMode)
      ? String(rawMode[0])
      : String(rawMode || "");
    let Model: any = elementsCollection;
    if (mode && mode.toLowerCase() === "assets") Model = elementsAssetsView;
    else if (mode && mode.toLowerCase() === "binding")
      Model = elementsBindingView;

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

// Get element by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const elementId = req.params.id;
  console.log("Fetching element with ID:", elementId);
  try {
    const rawMode = req.query.mode;
    const mode = Array.isArray(rawMode)
      ? String(rawMode[0])
      : String(rawMode || "");
    let Model: any = elementsCollection;
    if (mode && mode.toLowerCase() === "assets") Model = elementsAssetsView;
    else if (mode && mode.toLowerCase() === "binding")
      Model = elementsBindingView;

    const element = await Model.findById(elementId).exec();
    res.json(element);
  } catch (error) {
    logger.error("Error fetching element from MongoDB view:", error);
    res.status(500).json({
      message: "Element route failed to retrieve element with ID: " + elementId,
    });
  }
});

export default router;
