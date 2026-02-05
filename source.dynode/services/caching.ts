import { Types } from "mongoose";
import logger from "./logger";

// In-memory lock management with auto-expiration
interface LockEntry {
  acquiredAt: number;
  timeoutMs: number;
}

const locks = new Map<string, LockEntry>();

/**
 * Acquire a lock for a given key with timeout
 * @param key - Lock identifier
 * @param timeoutMs - Lock timeout in milliseconds
 * @returns true if lock acquired, false if already locked
 */
export function acquireLock(key: string, timeoutMs: number): boolean {
  const now = Date.now();
  const existing = locks.get(key);

  // Check if existing lock has expired
  if (existing && now - existing.acquiredAt < existing.timeoutMs) {
    return false; // Lock still held
  }

  // Acquire or renew lock
  locks.set(key, { acquiredAt: now, timeoutMs });
  logger.debug(`Lock acquired: ${key}`);
  return true;
}

/**
 * Release a lock for a given key
 * @param key - Lock identifier
 */
export function releaseLock(key: string): void {
  locks.delete(key);
  logger.debug(`Lock released: ${key}`);
}

/**
 * Get cached response if still valid
 * @param bufferId - ObjectId of buffer document
 * @param lifetimeSeconds - Cache lifetime in seconds
 * @returns Full buffer document if valid, null otherwise
 */
export async function getCachedResponse(
  bufferId: Types.ObjectId | null | undefined,
  lifetimeSeconds: number,
): Promise<any | null> {
  if (!bufferId) {
    return null;
  }

  try {
    const { BufferCollection } = await import("../app");
    const buffer = await BufferCollection.findById(bufferId);

    if (!buffer) {
      return null;
    }

    const now = new Date();
    const ageSeconds = (now.getTime() - buffer.timestamp.getTime()) / 1000;

    if (ageSeconds > lifetimeSeconds) {
      logger.debug(
        `Cache expired for buffer ${bufferId} (age: ${ageSeconds}s, lifetime: ${lifetimeSeconds}s)`,
      );
      return null;
    }

    logger.info(`Cache hit for buffer ${bufferId} (age: ${ageSeconds}s)`);
    return buffer.toObject(); // Return full buffer document
  } catch (error) {
    logger.error("Error retrieving cached response:", error);
    return null;
  }
}

/**
 * Store or update cached response
 * @param bufferId - ObjectId of buffer document to update, or ID to use for new document
 * @param data - Response data to cache
 * @param httpStatus - HTTP status code
 * @param forceCreate - If true, always create new document with bufferId as _id
 * @returns ObjectId of buffer document
 */
export async function setCachedResponse(
  bufferId: Types.ObjectId | null | undefined,
  data: any,
  httpStatus: number,
  forceCreate = false,
): Promise<Types.ObjectId> {
  try {
    const { BufferCollection } = await import("../app");
    const now = new Date();

    if (bufferId && !forceCreate) {
      // Update existing buffer
      await BufferCollection.findByIdAndUpdate(bufferId, {
        data,
        timestamp: now,
        httpStatus,
        updated: now,
        errorState: undefined,
      });
      logger.info(`Cache updated for buffer ${bufferId}`);
      return bufferId;
    } else if (bufferId && forceCreate) {
      // Create new buffer with specific _id
      const newBuffer = new BufferCollection({
        _id: bufferId,
        data,
        timestamp: now,
        httpStatus,
        created: now,
        updated: now,
      });
      await newBuffer.save();
      logger.info(`Cache created with buffer ${newBuffer._id}`);
      return newBuffer._id;
    } else {
      // Should not happen - bufferId should always be provided
      throw new Error("Buffer ID is required");
    }
  } catch (error) {
    logger.error("Error setting cached response:", error);
    throw error;
  }
}

export default {
  acquireLock,
  releaseLock,
  getCachedResponse,
  setCachedResponse,
};
