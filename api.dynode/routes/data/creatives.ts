import express, { Request, Response, NextFunction } from "express";
import logger from "../../services/logger";
import Creative from "../../models/Creative"; // <-- Import the model
const router = express.Router();

var mongoose = require("mongoose");

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatives = await Creative.find({});
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

export default router;
