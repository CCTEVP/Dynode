import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import SourcesCollection from "../../../models/collections/SourcesCollection";
import logger from "../../../services/logger";
import { validateResponse } from "../../../services/validator";
import {
  acquireLock,
  releaseLock,
  getCachedResponse,
  setCachedResponse,
} from "../../../services/caching";
import { generateSchema } from "../../../services/schemaGenerator";

const router = express.Router();

// GET all sources
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await SourcesCollection.find({});
    res.json(result);
  } catch (error) {
    logger.error("Error fetching sources:", error);
    res.status(500).json({ message: "Failed to retrieve sources." });
  }
});

// GET proxy endpoint - fetch from cache or external source
router.get(
  "/:sourceId/:endpointId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { sourceId, endpointId } = req.params;
    const forceBufferUpdate = req.query.forceBufferUpdate === "true";
    const readOnly = req.query.readOnly === "true";
    const forcePatternUpdate = req.query.forcePatternUpdate === "true";
    const editorUserId = req.user?.userId || "000000000000000000000000";
    const lockKey = `source:${sourceId}:endpoint:${endpointId}`;

    try {
      // Fetch source document
      const source = await SourcesCollection.findById(sourceId);
      if (!source) {
        res.status(404).json({ message: "Source not found." });
        return;
      }

      // Check if endpointId is an internal source or a variable within an internal source
      for (const internal of source.internal) {
        // Check if endpointId matches the internal source itself
        if (internal._id && internal._id.toString() === endpointId) {
          // Return the entire internal source with all variables
          res.json({
            name: internal.name,
            variables: internal.variables,
            _id: internal._id,
          });
          return;
        }

        // Check if endpointId matches a variable within this internal source
        const variable = internal.variables.find(
          (v: any) => v._id && v._id.toString() === endpointId,
        );
        if (variable) {
          // Return the specific variable
          res.json({
            name: variable.name,
            type: variable.type,
            value: variable.value,
            description: variable.description,
            _id: variable._id,
          });
          return;
        }
      }

      // Get endpoint by ID from external sources
      logger.debug(`Looking for endpoint ${endpointId} in source ${sourceId}`);
      logger.debug(
        `Available external endpoints:`,
        source.external.map((ep: any) => ({
          _id: ep._id?.toString(),
          name: ep.name,
        })),
      );

      const endpoint = source.external.find(
        (ep: any) => ep._id && ep._id.toString() === endpointId,
      );
      if (!endpoint) {
        res.status(404).json({
          message: "Endpoint not found.",
          hint: "Endpoint may not have an _id. Try recreating the source document.",
        });
        return;
      }

      // If readOnly mode, return buffer metadata without triggering cache logic
      if (readOnly) {
        const { BufferCollection } = await import("../../../app");
        const buffer = await BufferCollection.findById(endpoint._id);
        if (!buffer) {
          res.status(404).json({ message: "Buffer not found." });
          return;
        }

        // Regenerate pattern from buffer data if forcePatternUpdate is requested
        let pattern = buffer.pattern;
        if (forcePatternUpdate && buffer.data) {
          pattern = generateSchema(buffer.data);

          // Update the endpoint pattern in the source document
          await SourcesCollection.findByIdAndUpdate(
            sourceId,
            {
              $set: {
                "external.$[elem].pattern": pattern,
              },
            },
            {
              arrayFilters: [{ "elem._id": endpoint._id }],
              upsert: false,
              runValidators: false,
            },
          );

          logger.info(
            `Regenerated pattern from buffer data for endpoint ${endpoint._id}`,
          );
        }

        res.json({
          created: buffer.created,
          updated: buffer.updated,
          httpStatus: buffer.httpStatus,
          pattern: pattern,
          data: buffer.data,
        });
        return;
      }

      const timeoutMs = (endpoint.timeout || 30) * 1000;

      // Try to acquire lock
      if (!acquireLock(lockKey, timeoutMs)) {
        res
          .status(429)
          .json({ message: "Request already in progress, please retry." });
        return;
      }

      try {
        // Check cache first - use endpoint._id as buffer document ID (skip if forceBufferUpdate)
        if (!forceBufferUpdate) {
          const cached = await getCachedResponse(
            endpoint._id,
            endpoint.lifetime,
          );
          if (cached) {
            releaseLock(lockKey);
            res.status(200).json(cached); // Return full buffer document
            return;
          }
        } else {
          logger.info(
            `Force buffer update requested for endpoint ${endpointId}, bypassing cache`,
          );
        }

        // Cache miss - fetch from external source
        logger.info(
          `Cache miss, fetching from external source: ${endpoint.source}`,
        );
        const fetchResponse = await fetch(endpoint.source);
        const responseData = await fetchResponse.json();

        // Check for common error indicators in response (even with 200 status)
        const hasError =
          responseData.error !== undefined ||
          responseData.message?.toLowerCase().includes("error") ||
          responseData.status === "error" ||
          responseData.success === false ||
          (responseData.cod &&
            responseData.cod !== 200 &&
            responseData.cod !== "200");

        if (hasError) {
          releaseLock(lockKey);
          logger.warn(
            `API returned error response for endpoint ${endpointId}:`,
            responseData,
          );
          res.status(502).json({
            message: "External API returned an error response.",
            error: responseData,
          });
          return;
        }

        // Check if buffer document exists
        const { BufferCollection } = await import("../../../app");
        const existingBuffer = await BufferCollection.findById(endpoint._id);

        // Check if pattern needs to be generated (first time OR pattern is empty/missing)
        const needsPattern =
          !endpoint.pattern ||
          Object.keys(endpoint.pattern).length === 0 ||
          !existingBuffer;

        if (needsPattern) {
          const generatedPattern = generateSchema(responseData);
          logger.info(
            `Generated pattern for endpoint ${endpoint._id}:`,
            generatedPattern,
          );

          // Store pattern in endpoint
          await SourcesCollection.findByIdAndUpdate(
            sourceId,
            {
              $set: {
                "external.$[elem].pattern": generatedPattern,
                "external.$[elem].status": "valid",
              },
            },
            {
              arrayFilters: [{ "elem._id": endpoint._id }],
              upsert: false,
              runValidators: false,
            },
          );

          // Update local endpoint object for validation below
          endpoint.pattern = generatedPattern;
        }

        // Validate response against pattern
        const isValid = validateResponse(responseData, endpoint.pattern);

        if (isValid) {
          // Store valid response in buffer (using endpoint._id as buffer document _id)
          await setCachedResponse(
            endpoint._id,
            responseData,
            fetchResponse.status,
            !existingBuffer, // forceCreate if buffer doesn't exist yet
          );

          // Update endpoint status only if pattern wasn't just generated
          if (existingBuffer && !needsPattern) {
            await SourcesCollection.findByIdAndUpdate(
              sourceId,
              {
                $set: {
                  "external.$[elem].status": "valid",
                },
              },
              {
                arrayFilters: [{ "elem._id": endpoint._id }],
                upsert: false,
                runValidators: false,
              },
            );
          }

          // Fetch and return the full buffer document
          const bufferDoc = await BufferCollection.findById(endpoint._id);
          releaseLock(lockKey);
          res.status(200).json(bufferDoc);
        } else {
          // Validation failed - update endpoint status only (don't modify source timestamps on GET)
          await SourcesCollection.findByIdAndUpdate(
            sourceId,
            {
              $set: {
                "external.$[elem].status": "invalid",
              },
            },
            {
              arrayFilters: [{ "elem._id": endpoint._id }],
              upsert: false,
              runValidators: false,
            },
          );
          releaseLock(lockKey);
          res.status(502).json({
            message: "Response validation failed against pattern.",
            data: responseData,
          });
        }
      } finally {
        releaseLock(lockKey);
      }
    } catch (error) {
      releaseLock(lockKey);
      logger.error("Error in proxy endpoint:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch data from external source." });
    }
  },
);

// GET single source by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const sourceId = req.params.id;
  try {
    const result = await SourcesCollection.findById(sourceId);
    if (!result) {
      res.status(404).json({ message: "Source not found." });
      return;
    }
    res.json(result);
  } catch (error) {
    logger.error("Error fetching source:", error);
    res.status(500).json({ message: "Failed to retrieve source." });
  }
});

// POST create new source
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { name, external, internal } = req.body;

  if (!name) {
    res.status(400).json({ message: "Source name is required." });
    return;
  }

  try {
    const now = new Date();
    const newSource = new SourcesCollection({
      name,
      external: external || [],
      internal: internal || [],
      created: now,
      updated: now,
    });

    const savedSource = await newSource.save();
    logger.info(`Source created with ID: ${savedSource._id}`, {
      external: savedSource.external.map((ep: any) => ({
        _id: ep._id,
        name: ep.name,
        hasPattern: !!ep.pattern,
      })),
    });
    res.status(201).json(savedSource);
  } catch (error) {
    logger.error("Error creating source:", error);
    res.status(500).json({ message: "Failed to create source." });
  }
});

// PUT update source by ID
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const editorUserId = req.user?.userId || "000000000000000000000000";
  const sourceId = req.params.id;
  const updates = req.body;

  logger.debug(
    `PUT /data/sources/${sourceId} - Request body:`,
    JSON.stringify(updates, null, 2),
  );

  if (!sourceId || Object.keys(updates).length === 0) {
    res.status(400).json({
      message: "Source ID and at least one field to update are required",
    });
    return;
  }

  try {
    const source = await SourcesCollection.findById(sourceId);
    if (!source) {
      res.status(404).json({ message: "Source not found." });
      return;
    }

    // Ensure created field exists (for legacy documents)
    if (!source.created) {
      source.created = new Date();
    }

    // Helper function to convert string _id to ObjectId in arrays
    const convertIdsToObjectId = (items: any[]) => {
      if (!Array.isArray(items)) return items;
      return items.map((item) => {
        if (item._id && typeof item._id === "string") {
          return { ...item, _id: new mongoose.Types.ObjectId(item._id) };
        }
        return item;
      });
    };

    // Convert string _id values to ObjectId for internal and external arrays
    if (updates.internal) {
      updates.internal = convertIdsToObjectId(updates.internal);
    }
    if (updates.external) {
      updates.external = convertIdsToObjectId(updates.external);
    }

    // Collect all changes
    const oldValue: Record<string, any> = {};
    const newValue: Record<string, any> = {};
    let changed = false;

    for (const key of Object.keys(updates)) {
      if (
        key !== "_id" &&
        key !== "created" &&
        key !== "updated" &&
        key !== "changes"
      ) {
        const oldVal = JSON.stringify((source as any)[key]);
        const newVal = JSON.stringify(updates[key]);
        logger.debug(
          `Comparing field "${key}": old=${oldVal}, new=${newVal}, equal=${oldVal === newVal}`,
        );

        if (oldVal !== newVal) {
          oldValue[key] = (source as any)[key];
          newValue[key] = updates[key];
          (source as any)[key] = updates[key];
          changed = true;
        }
      } else {
        logger.debug(`Skipping field "${key}" (filtered out)`);
      }
    }

    logger.debug(`Change detection result: changed=${changed}`);

    if (changed) {
      source.updated = new Date();
      source.changes.push({
        timestamp: new Date(),
        user: editorUserId,
        oldValue,
        newValue,
      });
      await source.save();
      res.json(source);
      logger.info(`Source updated with ID: ${sourceId}`);
    } else {
      // No changes detected - return success with current source data
      res.json(source);
      logger.info(`Source update request with no changes for ID: ${sourceId}`);
    }
  } catch (error) {
    logger.error("Error updating source:", error);
    res.status(500).json({ message: "Failed to update source." });
  }
});

// DELETE source by ID
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const sourceId = req.params.id;

    try {
      const result = await SourcesCollection.findByIdAndDelete(sourceId);
      if (!result) {
        res.status(404).json({ message: "Source not found." });
        return;
      }
      res.json({ message: "Source deleted successfully", source: result });
      logger.info(`Source deleted with ID: ${sourceId}`);
    } catch (error) {
      logger.error("Error deleting source:", error);
      res.status(500).json({ message: "Failed to delete source." });
    }
  },
);

export default router;
