import express, { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import logger from "../../../services/logger";

const router = express.Router();

// Mongoose model/collection reference - using direct MongoDB connection
import mongoose from "mongoose";

const foldersCollection = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not available");
  }
  return db.collection("folders");
};

/**
 * GET /data/folders
 * Get all folders for the current user/domain
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Add authentication and filter by user/domain from req.user
    const collection = foldersCollection();
    logger.info(`[Folders] Querying collection: ${collection.collectionName}`);

    const folders = await collection
      .aggregate([
        // Lookup sources
        {
          $lookup: {
            from: "sources",
            localField: "_id",
            foreignField: "folder",
            as: "sourceItems",
          },
        },
        // Lookup creatives
        {
          $lookup: {
            from: "creatives_dynamics",
            localField: "_id",
            foreignField: "folder",
            as: "creativeItems",
          },
        },
        // Lookup assets
        {
          $lookup: {
            from: "assets",
            localField: "_id",
            foreignField: "folder",
            as: "assetItems",
          },
        },
        // Overwrite items field with IDs from lookups
        {
          $addFields: {
            items: {
              sources: {
                $map: { input: "$sourceItems", as: "item", in: "$$item._id" },
              },
              creatives: {
                $map: { input: "$creativeItems", as: "item", in: "$$item._id" },
              },
              assets: {
                $map: { input: "$assetItems", as: "item", in: "$$item._id" },
              },
            },
          },
        },
        // Remove temporary lookup fields
        {
          $project: {
            sourceItems: 0,
            creativeItems: 0,
            assetItems: 0,
          },
        },
        // Sort
        { $sort: { name: 1 } },
      ])
      .toArray();

    logger.info(`[Folders] Found ${folders.length} folders`);
    res.json(folders);
  } catch (error) {
    logger.error("Error fetching folders:", error);
    res.status(500).json({ message: "Failed to retrieve folders." });
  }
});

/**
 * GET /data/folders/:id
 * Get a single folder by ID
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid folder ID." });
      return;
    }

    const collection = foldersCollection();
    const result = await collection
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        // Lookup sources
        {
          $lookup: {
            from: "sources",
            localField: "_id",
            foreignField: "folder",
            as: "sourceItems",
          },
        },
        // Lookup creatives
        {
          $lookup: {
            from: "creatives_dynamics",
            localField: "_id",
            foreignField: "folder",
            as: "creativeItems",
          },
        },
        // Lookup assets
        {
          $lookup: {
            from: "assets",
            localField: "_id",
            foreignField: "folder",
            as: "assetItems",
          },
        },
        // Overwrite items field with IDs from lookups
        {
          $addFields: {
            items: {
              sources: {
                $map: { input: "$sourceItems", as: "item", in: "$$item._id" },
              },
              creatives: {
                $map: { input: "$creativeItems", as: "item", in: "$$item._id" },
              },
              assets: {
                $map: { input: "$assetItems", as: "item", in: "$$item._id" },
              },
            },
          },
        },
        // Remove temporary lookup fields
        {
          $project: {
            sourceItems: 0,
            creativeItems: 0,
            assetItems: 0,
          },
        },
      ])
      .toArray();

    const folder = result[0];

    if (!folder) {
      res.status(404).json({ message: "Folder not found." });
      return;
    }

    res.json(folder);
  } catch (error) {
    logger.error("Error fetching folder:", error);
    res.status(500).json({ message: "Failed to retrieve folder." });
  }
});

/**
 * POST /data/folders
 * Create a new folder
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, parent, color } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      res.status(400).json({ message: "Folder name is required." });
      return;
    }

    // Validate parent if provided
    if (parent && !Types.ObjectId.isValid(parent)) {
      res.status(400).json({ message: "Invalid parent folder ID." });
      return;
    }

    // Check depth limit (max 3 levels: 0, 1, 2)
    let depth = 0;
    if (parent) {
      const parentFolder = await foldersCollection().findOne({
        _id: new Types.ObjectId(parent),
      });

      if (!parentFolder) {
        res.status(404).json({ message: "Parent folder not found." });
        return;
      }

      // Calculate depth
      depth = await calculateFolderDepth(parent);

      if (depth >= 2) {
        res
          .status(400)
          .json({ message: "Maximum folder depth (3 levels) exceeded." });
        return;
      }
    }

    // TODO: Get owner from authenticated user
    const newFolder = {
      name: name.trim(),
      owner: {
        domain: new Types.ObjectId("68a6d1e18c127df5e97b6a91"), // Placeholder
        user: new Types.ObjectId("68a6d1ec8c127df5e97b6a92"), // Placeholder
      },
      items: {
        creatives: [],
        sources: [],
        assets: [],
      },
      domains: [new Types.ObjectId("68a6d1e18c127df5e97b6a91")], // Placeholder
      ...(parent && { parent: new Types.ObjectId(parent) }),
      attributes: {
        ...(color && { color }),
      },
      created: new Date(),
      updated: new Date(),
    };

    const result = await foldersCollection().insertOne(newFolder);
    const createdFolder = await foldersCollection().findOne({
      _id: result.insertedId,
    });

    res.status(201).json(createdFolder);
  } catch (error) {
    logger.error("Error creating folder:", error);
    res.status(500).json({ message: "Failed to create folder." });
  }
});

/**
 * PUT /data/folders/:id
 * Update an existing folder
 */
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, parent, color } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid folder ID." });
      return;
    }

    const folder = await foldersCollection().findOne({
      _id: new Types.ObjectId(id),
    });

    if (!folder) {
      res.status(404).json({ message: "Folder not found." });
      return;
    }

    const updates: any = { updated: new Date() };

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        res.status(400).json({ message: "Folder name is required." });
        return;
      }
      updates.name = name.trim();
    }

    if (parent !== undefined) {
      if (parent === null) {
        // Moving to root
        updates.$unset = { parent: "" };
      } else {
        if (!Types.ObjectId.isValid(parent)) {
          res.status(400).json({ message: "Invalid parent folder ID." });
          return;
        }

        // Prevent circular reference
        if (parent === id) {
          res
            .status(400)
            .json({ message: "A folder cannot be its own parent." });
          return;
        }

        // Check if new parent is a descendant
        const isDescendant = await isDescendantOf(id, parent);
        if (isDescendant) {
          res.status(400).json({
            message: "Cannot move folder to one of its descendants.",
          });
          return;
        }

        // Check depth limit
        const newDepth = await calculateFolderDepth(parent);
        if (newDepth >= 2) {
          res
            .status(400)
            .json({ message: "Maximum folder depth (3 levels) exceeded." });
          return;
        }

        updates.parent = new Types.ObjectId(parent);
      }
    }

    if (color !== undefined) {
      if (color === null) {
        if (!updates.$unset) updates.$unset = {};
        updates.$unset["attributes.color"] = "";
      } else {
        updates["attributes.color"] = color;
      }
    }

    await foldersCollection().updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: updates, ...(updates.$unset && { $unset: updates.$unset }) },
    );

    const updatedFolder = await foldersCollection().findOne({
      _id: new Types.ObjectId(id),
    });

    res.json(updatedFolder);
  } catch (error) {
    logger.error("Error updating folder:", error);
    res.status(500).json({ message: "Failed to update folder." });
  }
});

/**
 * DELETE /data/folders/:id
 * Delete a folder (items remain, just removed from folder)
 */
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid folder ID." });
        return;
      }

      const folder = await foldersCollection().findOne({
        _id: new Types.ObjectId(id),
      });

      if (!folder) {
        res.status(404).json({ message: "Folder not found." });
        return;
      }

      // Check if folder has children
      const hasChildren = await foldersCollection().countDocuments({
        parent: new Types.ObjectId(id),
      });

      if (hasChildren > 0) {
        res.status(400).json({
          message:
            "Cannot delete folder with subfolders. Please delete or move child folders first.",
        });
        return;
      }

      await foldersCollection().deleteOne({ _id: new Types.ObjectId(id) });

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder." });
    }
  },
);

/**
 * GET /data/folders/:id/breadcrumb
 * Get folder path from root to specified folder
 */
router.get(
  "/:id/breadcrumb",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid folder ID." });
        return;
      }

      const breadcrumb = await buildBreadcrumb(id);
      res.json(breadcrumb);
    } catch (error) {
      logger.error("Error building breadcrumb:", error);
      res.status(500).json({ message: "Failed to build breadcrumb." });
    }
  },
);

/**
 * GET /data/folders/:id/depth
 * Get folder depth level (0-2)
 */
router.get(
  "/:id/depth",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid folder ID." });
        return;
      }

      const depth = await calculateFolderDepth(id);
      res.json({ depth });
    } catch (error) {
      logger.error("Error calculating folder depth:", error);
      res.status(500).json({ message: "Failed to calculate folder depth." });
    }
  },
);

/**
 * GET /data/folders/:id/isEmpty
 * Check if folder has no items assigned
 */
router.get(
  "/:id/isEmpty",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid folder ID." });
        return;
      }

      const collection = foldersCollection();
      const result = await collection
        .aggregate([
          { $match: { _id: new Types.ObjectId(id) } },
          // Lookup sources
          {
            $lookup: {
              from: "sources",
              localField: "_id",
              foreignField: "folder",
              as: "sourceItems",
            },
          },
          // Lookup creatives
          {
            $lookup: {
              from: "creatives_dynamics",
              localField: "_id",
              foreignField: "folder",
              as: "creativeItems",
            },
          },
          // Lookup assets
          {
            $lookup: {
              from: "assets",
              localField: "_id",
              foreignField: "folder",
              as: "assetItems",
            },
          },
        ])
        .toArray();

      const folder = result[0];

      if (!folder) {
        res.status(404).json({ message: "Folder not found." });
        return;
      }

      const isEmpty =
        (!folder.sourceItems || folder.sourceItems.length === 0) &&
        (!folder.creativeItems || folder.creativeItems.length === 0) &&
        (!folder.assetItems || folder.assetItems.length === 0);

      res.json({ isEmpty });
    } catch (error) {
      logger.error("Error checking if folder is empty:", error);
      res.status(500).json({ message: "Failed to check folder status." });
    }
  },
);

/**
 * POST /data/folders/:id/items
 * Add item to folder
 */
router.post(
  "/:id/items",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { type, itemId } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid folder ID." });
        return;
      }

      if (!["creatives", "sources", "assets"].includes(type)) {
        res.status(400).json({ message: "Invalid item type." });
        return;
      }

      if (!Types.ObjectId.isValid(itemId)) {
        res.status(400).json({ message: "Invalid item ID." });
        return;
      }

      const folder = await foldersCollection().findOne({
        _id: new Types.ObjectId(id),
      });

      if (!folder) {
        res.status(404).json({ message: "Folder not found." });
        return;
      }

      // Update the item's folder reference (Single Source of Truth)
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database connection not available");
      }

      let collectionName: string;
      switch (type) {
        case "creatives":
          collectionName = "creatives_dynamics";
          break;
        case "sources":
          collectionName = "sources";
          break;
        case "assets":
          collectionName = "assets";
          break;
        default:
          res.status(400).json({ message: "Invalid item type." });
          return;
      }

      await db.collection(collectionName).updateOne(
        { _id: new Types.ObjectId(itemId) },
        {
          $set: { folder: new Types.ObjectId(id), updated: new Date() },
        },
      );

      // Return the updated folder (by fetching it again, which triggers the aggregation)
      // We can redirect to the GET /:id logic by calling the API or just refetching with aggregation locally?
      // For simplicity, let's just return success or fetch via aggregation.
      // Since existing code expects the folder object, let's fetch it.
      // Reuse the GET logic? We can't easily call route.
      // Let's just do the aggregation fetch here.

      const result = await foldersCollection()
        .aggregate([
          { $match: { _id: new Types.ObjectId(id) } },
          {
            $lookup: {
              from: "sources",
              localField: "_id",
              foreignField: "folder",
              as: "sourceItems",
            },
          },
          {
            $lookup: {
              from: "creatives_dynamics",
              localField: "_id",
              foreignField: "folder",
              as: "creativeItems",
            },
          },
          {
            $lookup: {
              from: "assets",
              localField: "_id",
              foreignField: "folder",
              as: "assetItems",
            },
          },
          {
            $addFields: {
              items: {
                sources: {
                  $map: { input: "$sourceItems", as: "item", in: "$$item._id" },
                },
                creatives: {
                  $map: {
                    input: "$creativeItems",
                    as: "item",
                    in: "$$item._id",
                  },
                },
                assets: {
                  $map: { input: "$assetItems", as: "item", in: "$$item._id" },
                },
              },
            },
          },
          {
            $project: {
              sourceItems: 0,
              creativeItems: 0,
              assetItems: 0,
            },
          },
        ])
        .toArray();

      res.json(result[0]);
    } catch (error) {
      logger.error("Error adding item to folder:", error);
      res.status(500).json({ message: "Failed to add item to folder." });
    }
  },
);

/**
 * DELETE /data/folders/:id/items/:type/:itemId
 * Remove item from folder
 */
router.delete(
  "/:id/items/:type/:itemId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, type, itemId } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid folder ID." });
        return;
      }

      if (!["creatives", "sources", "assets"].includes(type)) {
        res.status(400).json({ message: "Invalid item type." });
        return;
      }

      if (!Types.ObjectId.isValid(itemId)) {
        res.status(400).json({ message: "Invalid item ID." });
        return;
      }

      // Update the item's folder reference (Single Source of Truth)
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database connection not available");
      }

      let collectionName: string;
      switch (type) {
        case "creatives":
          collectionName = "creatives_dynamics";
          break;
        case "sources":
          collectionName = "sources";
          break;
        case "assets":
          collectionName = "assets";
          break;
        default:
          res.status(400).json({ message: "Invalid item type." });
          return;
      }

      await db.collection(collectionName).updateOne(
        { _id: new Types.ObjectId(itemId) },
        {
          $unset: { folder: "" },
          $set: { updated: new Date() },
        },
      );

      const result = await foldersCollection()
        .aggregate([
          { $match: { _id: new Types.ObjectId(id) } },
          {
            $lookup: {
              from: "sources",
              localField: "_id",
              foreignField: "folder",
              as: "sourceItems",
            },
          },
          {
            $lookup: {
              from: "creatives_dynamics",
              localField: "_id",
              foreignField: "folder",
              as: "creativeItems",
            },
          },
          {
            $lookup: {
              from: "assets",
              localField: "_id",
              foreignField: "folder",
              as: "assetItems",
            },
          },
          {
            $addFields: {
              items: {
                sources: {
                  $map: { input: "$sourceItems", as: "item", in: "$$item._id" },
                },
                creatives: {
                  $map: {
                    input: "$creativeItems",
                    as: "item",
                    in: "$$item._id",
                  },
                },
                assets: {
                  $map: { input: "$assetItems", as: "item", in: "$$item._id" },
                },
              },
            },
          },
          {
            $project: {
              sourceItems: 0,
              creativeItems: 0,
              assetItems: 0,
            },
          },
        ])
        .toArray();

      res.json(result[0]);
    } catch (error) {
      logger.error("Error removing item from folder:", error);
      res.status(500).json({ message: "Failed to remove item from folder." });
    }
  },
);

/**
 * POST /data/folders/bulk-assign
 * Bulk assign items to a folder by updating the 'folder' field on items
 */
router.post(
  "/bulk-assign",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { folderId, itemType, itemIds } = req.body;

      if (!["creatives", "sources", "assets"].includes(itemType)) {
        res.status(400).json({ message: "Invalid item type." });
        return;
      }

      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        res.status(400).json({ message: "Item IDs are required." });
        return;
      }

      // Validate all item IDs
      for (const itemId of itemIds) {
        if (!Types.ObjectId.isValid(itemId)) {
          res.status(400).json({ message: `Invalid item ID: ${itemId}` });
          return;
        }
      }

      const itemObjectIds = itemIds.map((id) => new Types.ObjectId(id));
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database connection not available");
      }

      // Determine the collection name based on item type
      let collectionName: string;
      switch (itemType) {
        case "creatives":
          collectionName = "creatives_dynamics";
          break;
        case "sources":
          collectionName = "sources";
          break;
        case "assets":
          collectionName = "assets";
          break;
        default:
          res.status(400).json({ message: "Invalid item type." });
          return;
      }

      const itemsCollection = db.collection(collectionName);

      if (folderId === null) {
        // Remove folder field from items (move to root)
        await itemsCollection.updateMany(
          { _id: { $in: itemObjectIds } },
          { $unset: { folder: "" }, $set: { updated: new Date() } },
        );
      } else {
        if (!Types.ObjectId.isValid(folderId)) {
          res.status(400).json({ message: "Invalid folder ID." });
          return;
        }

        const folder = await foldersCollection().findOne({
          _id: new Types.ObjectId(folderId),
        });

        if (!folder) {
          res.status(404).json({ message: "Folder not found." });
          return;
        }

        // Set folder field on items
        await itemsCollection.updateMany(
          { _id: { $in: itemObjectIds } },
          {
            $set: { folder: new Types.ObjectId(folderId), updated: new Date() },
          },
        );
      }

      res.status(200).json({ message: "Items assigned successfully." });
    } catch (error) {
      logger.error("Error bulk assigning items:", error);
      res.status(500).json({ message: "Failed to assign items." });
    }
  },
);

// Helper functions

/**
 * Calculate folder depth (how many levels deep from root)
 */
async function calculateFolderDepth(folderId: string): Promise<number> {
  let depth = 0;
  let currentId = folderId;

  while (currentId) {
    const folder = await foldersCollection().findOne({
      _id: new Types.ObjectId(currentId),
    });

    if (!folder || !folder.parent) {
      break;
    }

    depth++;
    currentId = folder.parent.toString();
  }

  return depth;
}

/**
 * Build breadcrumb path from root to specified folder
 */
async function buildBreadcrumb(folderId: string): Promise<any[]> {
  const breadcrumb = [];
  let currentId = folderId;

  while (currentId) {
    const folder = await foldersCollection().findOne({
      _id: new Types.ObjectId(currentId),
    });

    if (!folder) {
      break;
    }

    breadcrumb.unshift({
      _id: folder._id.toString(),
      name: folder.name,
      color: folder.attributes?.color,
    });

    currentId = folder.parent?.toString();
  }

  return breadcrumb;
}

/**
 * Check if targetId is a descendant of folderId
 */
async function isDescendantOf(
  folderId: string,
  targetId: string,
): Promise<boolean> {
  let currentId = targetId;

  while (currentId) {
    if (currentId === folderId) {
      return true;
    }

    const folder = await foldersCollection().findOne({
      _id: new Types.ObjectId(currentId),
    });

    if (!folder || !folder.parent) {
      break;
    }

    currentId = folder.parent.toString();
  }

  return false;
}

export default router;
