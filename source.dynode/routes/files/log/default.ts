import express, { Request, Response } from "express";
import logger, { getLogCollectionModel } from "../../../services/logger";

const router = express.Router();

const allowedLevels = [
  "info",
  "error",
  "warn",
  "debug",
  "http",
  "verbose",
] as const;
type LogLevel = (typeof allowedLevels)[number];

// POST: Write a log entry
router.post("/", (req, res) => {
  const { level, message, meta, origin } = req.body;
  if (allowedLevels.includes(level)) {
    // Pass origin as part of the log metadata so winston can pick it up
    const logMeta = origin ? { ...meta, origin } : meta;
    (logger as any)[level](message, logMeta);
  }
  res.sendStatus(204);
});

// GET: Query log entries with filters
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the correct model from the log database connection
    const LogCollection = getLogCollectionModel();
    if (!LogCollection) {
      res.status(503).json({
        message: "Log database not ready",
      });
      return;
    }

    const {
      userId,
      sessionId,
      startDate,
      endDate,
      level,
      levels, // Multiple levels comma-separated
      message, // Text search in message
      meta, // Text search in metadata (as JSON string)
      limit = "100",
      skip = "0",
      sort = "timestamp",
      order = "desc",
    } = req.query;

    // Build query filter
    const filter: Record<string, any> = {};

    // Level filtering
    if (levels && typeof levels === "string") {
      // Multiple levels specified
      const levelArray = levels
        .split(",")
        .filter((l) => allowedLevels.includes(l as LogLevel));
      if (levelArray.length > 0) {
        filter.level = { $in: levelArray };
      }
    } else if (
      level &&
      typeof level === "string" &&
      allowedLevels.includes(level as LogLevel)
    ) {
      // Single level specified
      filter.level = level;
    }

    if (userId && typeof userId === "string") {
      filter.userId = userId;
    }

    if (sessionId && typeof sessionId === "string") {
      filter.sessionId = sessionId;
    }

    // Origin filtering (e.g., render.dynode, source.dynode, etc.)
    const origin = req.query.origin;
    if (origin && typeof origin === "string") {
      filter.origin = origin;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate && typeof startDate === "string") {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    if (message && typeof message === "string") {
      filter.message = { $regex: message, $options: "i" }; // Case-insensitive search
    }

    if (meta && typeof meta === "string") {
      // Search within metadata object
      filter["metadata"] = { $regex: meta, $options: "i" };
    }

    // Execute single optimized query
    const [data, totalCount] = await Promise.all([
      LogCollection.find(filter)
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ [sort as string]: order === "asc" ? 1 : -1 })
        .lean()
        .exec(),
      LogCollection.countDocuments(filter).exec(),
    ]);

    res.json({
      data,
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string),
        skip: parseInt(skip as string),
      },
    });
  } catch (error) {
    logger.error("Error querying logs:", error);
    res.status(500).json({
      message: "Failed to query logs",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
