import express, { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import config from "../../../config";
import logger from "../../../services/logger";

const router = express.Router();

// MongoDB connection helper
async function getCodebaseDB() {
  const client = await MongoClient.connect(config.mongoUri);
  return client.db("dyna_codebase");
}

// GET all files with optional filters
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const project = req.query.project as string;
  const category = req.query.category as string;

  try {
    const db = await getCodebaseDB();
    const collection = db.collection("files_dependencies");

    const filter: any = {};
    if (project) filter.project = project;
    if (category) filter.category = category;

    const result = await collection.find(filter).toArray();

    if (!result) {
      res.status(404).json({ message: "Files not found." });
      return;
    }

    res.json(result);
  } catch (error) {
    logger.error("Error fetching codebase files:", error);
    res.status(500).json({ message: "Failed to retrieve codebase files." });
  }
});

// GET single file by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const fileId = req.params.id;

  try {
    const db = await getCodebaseDB();
    const collection = db.collection("files_dependencies");

    // MongoDB stores _id as string in our data, not ObjectId
    const result = await collection.findOne({ _id: fileId } as any);

    if (!result) {
      res.status(404).json({ message: "File not found." });
      return;
    }

    res.json(result);
  } catch (error) {
    logger.error("Error fetching codebase file:", error);
    res.status(500).json({ message: "Failed to retrieve codebase file." });
  }
});

export default router;
