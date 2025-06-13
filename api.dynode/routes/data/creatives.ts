import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
import CreativeDynamic from "../../models/CreativeDynamic"; // <-- Import the model
import CreativeAssembly from "../../models/CreativeAssembly"; // <-- Import the model
import CreativeInteractive from "../../models/CreativeInteractive"; // <-- Import the model
import CreativeUnified from "../../models/CreativeUnified"; // <-- Import the model
const router = express.Router();

var mongoose = require("mongoose");

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatives = await CreativeUnified.find({});
    res.json(creatives);
  } catch (error) {
    console.error("Error fetching creatives from MongoDB view:", error);
    res.status(500).json({ message: "Failed to retrieve creatives." });
  }
});

router.put(
  "/",
  async function (req: Request, res: Response, next: NextFunction) {
    res.json({
      message:
        "This is a placeholder for PUT requests to /data/creatives. Implement your logic here.",
    });
  }
);

router.post(
  "/",
  async function (req: Request, res: Response, next: NextFunction) {
    res.json({
      message:
        "This is a placeholder for POST requests to /data/creatives. Implement your logic here.",
    });
  }
);

router.delete("/", async function (req, res, next) {
  res.json({
    message:
      "This is a placeholder for DELETE requests to /data/creatives. Implement your logic here.",
  });
});

//// Assemblies
router.get(
  "/assemblies",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const creatives = await CreativeAssembly.find({});
      res.json(creatives);
    } catch (error) {
      console.error("Error fetching creatives from MongoDB view:", error);
      res.status(500).json({ message: "Failed to retrieve creatives." });
    }
  }
);

//// Dynamics
router.get(
  "/dynamics",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const creatives = await CreativeDynamic.find({});
      res.json(creatives);
    } catch (error) {
      console.error("Error fetching creatives from MongoDB view:", error);
      res.status(500).json({ message: "Failed to retrieve creatives." });
    }
  }
);

//// Interactives
router.get(
  "/interactives",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const creatives = await CreativeInteractive.find({});
      res.json(creatives);
    } catch (error) {
      console.error("Error fetching creatives from MongoDB view:", error);
      res.status(500).json({ message: "Failed to retrieve creatives." });
    }
  }
);

export default router;
