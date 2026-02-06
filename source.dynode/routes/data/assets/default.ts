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

    logger.info(`[Assets Update] PUT /data/assets/${id}`, {
      requestBody: req.body,
    });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid asset bundle ID." });
      return;
    }

    const asset = await AssetsCollection.findById(id);
    if (!asset) {
      res.status(404).json({ message: "Asset bundle not found." });
      return;
    }

    logger.info(`[Assets Update] Found asset`, {
      _id: asset._id,
      name: asset.name,
      bundleCount: asset.bundle?.length || 0,
    });

    // Ensure created field exists (for legacy docs)
    if (!asset.created) {
      asset.created = now;
    }

    // Store raw request body for change tracking (before conversion)
    const rawRequestData = JSON.parse(JSON.stringify(req.body));

    // Helper function to convert string _id to ObjectId in bundle items
    const convertBundleIds = (bundle: any[]) => {
      if (!Array.isArray(bundle)) return bundle;
      return bundle.map((item, idx) => {
        logger.debug(`[Assets Update] Converting bundle item ${idx}`, { item });
        const converted = { ...item };
        if (converted._id && typeof converted._id === "string") {
          converted._id = new mongoose.Types.ObjectId(converted._id);
        }
        // Convert timestamps to Date objects if they are strings
        if (converted.created && typeof converted.created === "string") {
          converted.created = new Date(converted.created);
        } else if (!converted.created) {
          converted.created = now;
        }
        if (converted.updated && typeof converted.updated === "string") {
          converted.updated = new Date(converted.updated);
        } else if (!converted.updated) {
          converted.updated = now;
        }
        logger.debug(`[Assets Update] Converted to`, { converted });
        return converted;
      });
    };

    // Convert string _id values to ObjectId for bundle array
    const updates = { ...req.body };
    if (updates.bundle) {
      logger.info(
        `[Assets Update] Converting ${updates.bundle.length} bundle items`,
      );
      updates.bundle = convertBundleIds(updates.bundle);
      logger.info(`[Assets Update] Bundle conversion complete`);
    }

    // Compare updatable fields
    let changed = false;
    const oldValue: Record<string, any> = {};
    const newValue: Record<string, any> = {};

    // Compare and update 'name'
    if (asset.name !== updates.name) {
      oldValue.name = asset.name;
      newValue.name = rawRequestData.name;
      asset.name = updates.name || "";
      changed = true;
    }

    // Compare and update 'bundle'
    const oldBundleStr = JSON.stringify(asset.bundle);
    const newBundleStr = JSON.stringify(updates.bundle);
    logger.info(
      `[Assets Update] Comparing bundles - changed: ${oldBundleStr !== newBundleStr}`,
    );
    if (oldBundleStr !== newBundleStr) {
      oldValue.bundle = JSON.parse(JSON.stringify(asset.bundle));
      newValue.bundle = rawRequestData.bundle; // Use raw data, not converted
      asset.bundle = updates.bundle || [];
      changed = true;
    }

    if (changed) {
      const changeRecord = {
        timestamp: now,
        user: new mongoose.Types.ObjectId(editorUserId),
        oldValue,
        newValue,
      };

      // Use findByIdAndUpdate to avoid validation errors on existing subdocuments
      const updatedAsset = await AssetsCollection.findByIdAndUpdate(
        id,
        {
          $set: {
            name: asset.name,
            bundle: asset.bundle,
            updated: now,
          },
          $push: {
            changes: changeRecord,
          },
        },
        {
          new: true,
          runValidators: false,
        },
      );

      logger.info(`Asset bundle updated with ID: ${id}`);
      res.json(updatedAsset);
    } else {
      logger.info(`Asset bundle update request with no changes for ID: ${id}`);
      res.json(asset);
    }
  } catch (error) {
    logger.error("Error updating asset bundle", {
      error,
      errorName: (error as any).name,
      errorMessage: (error as any).message,
      errorStack: (error as any).stack,
    });
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
