import express, { Request, Response, NextFunction } from "express";
import ComponentsCollection from "../../../models/collections/ComponentsCollection";
import logger from "../../../services/logger";
const router = express.Router();

// GET all components
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const componentType = req.query.type as string; // Layout or Widget
  try {
    let result;
    if (componentType) {
      result = await ComponentsCollection.find({
        type: { $regex: new RegExp(`${componentType}$`, "i") },
      });
    } else {
      result = await ComponentsCollection.find({});
    }
    if (!result) {
      res.status(404).json({ message: "Component not found." });
      return;
    }

    res.json(result);
  } catch (error) {
    logger.error("Error fetching components:", error);
    res.status(500).json({ message: "Failed to retrieve components." });
  }
});

// GET single component by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const componentId = req.params.id;
  try {
    const result = await ComponentsCollection.findById(componentId);
    if (!result) {
      res.status(404).json({ message: "Component not found." });
      return;
    }
    res.json(result);
  } catch (error) {
    logger.error("Error fetching component:", error);
    res.status(500).json({ message: "Failed to retrieve component." });
  }
});
export default router;
