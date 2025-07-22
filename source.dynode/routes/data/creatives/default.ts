import express, { Request, Response, NextFunction } from "express";
import logger from "../../../services/logger";
import assembliesRouter from "./assemblies/default";
import dynamicsRouter from "./dynamics/default";
import interactivesRouter from "./interactives/default";
import CreativeUnifiedView from "../../../models/views/CreativeUnifiedView";

const router = express.Router();
// Mount sub-routers
router.use("/assemblies", assembliesRouter);
router.use("/dynamics", dynamicsRouter);
router.use("/interactives", interactivesRouter);

// List all creatives
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatives = await CreativeUnifiedView.find({});
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
    const creative = await CreativeUnifiedView.findById(creativeId).exec();
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
