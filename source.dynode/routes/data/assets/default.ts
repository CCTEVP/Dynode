import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import AssetsCollection from "../../../models/collections/AssetsCollection";
import logger from "../../../services/logger";

const router = express.Router();

// GET all asset bundles
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AssetsCollection.find({});
    res.json(result);
  } catch (error) {
    logger.error("Error fetching assets:", error);
    res.status(500).json({ message: "Failed to retrieve assets." });
  }
});

// GET single asset bundle by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid asset bundle ID." });
      return;
    }

    const result = await AssetsCollection.findById(id);

    if (!result) {
      res.status(404).json({ message: "Asset bundle not found." });
      return;
    }

    res.json(result);
  } catch (error) {
    logger.error("Error fetching asset bundle:", error);
    res.status(500).json({ message: "Failed to retrieve asset bundle." });
  }
});

// POST create new asset bundle
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const editorUserId = req.user?.userId || "000000000000000000000000";
    const now = new Date();

    const newAsset = new AssetsCollection({
      name: req.body.name || "",
      bundle: req.body.bundle || [],
      created: now,
      updated: now,
      changes: [
        {
          timestamp: now,
          user: new mongoose.Types.ObjectId(editorUserId),
        },
      ],
    });

    await newAsset.save();
    logger.info(`Asset bundle created: ${newAsset._id}`);
    res.status(201).json(newAsset);
  } catch (error) {
    logger.error("Error creating asset bundle:", error);
    res.status(500).json({ message: "Failed to create asset bundle." });
  }
});

// PUT update asset bundle
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const editorUserId = req.user?.userId || "000000000000000000000000";
    const now = new Date();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid asset bundle ID." });
      return;
    }

    const asset = await AssetsCollection.findById(id);
    if (!asset) {
      res.status(404).json({ message: "Asset bundle not found." });
      return;
    }

    // Ensure created field exists (for legacy docs)
    if (!asset.created) {
      asset.created = now;
    }

    // Compare updatable fields
    let changed = false;
    const oldValue: Record<string, any> = {};
    const newValue: Record<string, any> = {};

    // Compare and update 'name'
    if (asset.name !== req.body.name) {
      oldValue.name = asset.name;
      newValue.name = req.body.name;
      asset.name = req.body.name || "";
      changed = true;
    }
    // Compare and update 'bundle'
    if (JSON.stringify(asset.bundle) !== JSON.stringify(req.body.bundle)) {
      oldValue.bundle = asset.bundle;
      newValue.bundle = req.body.bundle;
      asset.bundle = req.body.bundle || [];
      changed = true;
    }

    if (changed) {
      asset.updated = now;
      asset.changes.push({
        timestamp: now,
        user: new mongoose.Types.ObjectId(editorUserId),
        oldValue,
        newValue,
      });
      await asset.save();
      logger.info(`Asset bundle updated: ${id}`);
    } else {
      logger.info(`Asset bundle update request with no changes for ID: ${id}`);
    }
    res.json(asset);
  } catch (error) {
    logger.error("Error updating asset bundle:", error);
    res.status(500).json({ message: "Failed to update asset bundle." });
  }
});

// DELETE asset bundle and all associated files
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid asset bundle ID." });
        return;
      }

      const asset = await AssetsCollection.findById(id);

      if (!asset) {
        res.status(404).json({ message: "Asset bundle not found." });
        return;
      }

      // Delete all files associated with this bundle
      const deletedFiles: string[] = [];
      const failedFiles: string[] = [];

      for (const bundleItem of asset.bundle) {
        for (const pathItem of bundleItem.paths) {
          try {
            const { filename, extension } = pathItem;
            let folder = "";

            if (bundleItem.kind === "video") folder = "video";
            else if (bundleItem.kind === "image") folder = "image";
            else if (bundleItem.kind === "font") folder = `font/${filename}`;

            const filePath = path.join(
              __dirname,
              "../../../files",
              folder,
              `${filename}.${extension}`,
            );

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedFiles.push(`${filename}.${extension}`);
              logger.info(`Deleted file: ${filePath}`);
            }
          } catch (fileError) {
            logger.error(
              `Failed to delete file ${pathItem.filename}:`,
              fileError,
            );
            failedFiles.push(`${pathItem.filename}.${pathItem.extension}`);
          }
        }
      }

      // Delete the database document
      await AssetsCollection.findByIdAndDelete(id);

      logger.info(
        `Asset bundle deleted: ${id} (${deletedFiles.length} files deleted)`,
      );
      res.json({
        message: "Asset bundle deleted successfully.",
        deletedFiles,
        failedFiles,
      });
    } catch (error) {
      logger.error("Error deleting asset bundle:", error);
      res.status(500).json({ message: "Failed to delete asset bundle." });
    }
  },
);

export default router;
