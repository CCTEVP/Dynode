import mongoose from "mongoose";
import config from "../config";
import logger from "./logger";
import LogCollection from "../models/collections/LogCollection";

/**
 * Log cleanup service - Manual backup to TTL indexes
 * Deletes log documents older than the configured retention period
 */

/**
 * Delete logs older than retention period from logs collection
 * @returns Summary of deletion results
 */
export async function cleanupOldLogs(): Promise<{
  success: boolean;
  deleted: number;
  error?: string;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.logRetentionDays);

  logger.info(
    `Starting log cleanup for records older than ${cutoffDate.toISOString()}`,
  );

  try {
    const result = await LogCollection.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    const deleted = result.deletedCount || 0;

    logger.info(`Log cleanup completed. Deleted ${deleted} old log entries`);

    return {
      success: true,
      deleted,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error cleaning logs: ${errorMessage}`);

    return {
      success: false,
      deleted: 0,
      error: errorMessage,
    };
  }
}

/**
 * Get log statistics
 * @returns Count of documents per level and overall stats
 */
export async function getLogStats(): Promise<{
  total: number;
  byLevel: Record<string, number>;
  oldestLog?: Date;
  newestLog?: Date;
}> {
  try {
    const [total, byLevel, oldest, newest] = await Promise.all([
      LogCollection.countDocuments(),
      LogCollection.aggregate([
        { $group: { _id: "$level", count: { $sum: 1 } } },
      ]),
      LogCollection.findOne().sort({ timestamp: 1 }).exec(),
      LogCollection.findOne().sort({ timestamp: -1 }).exec(),
    ]);

    const levelCounts: Record<string, number> = {};
    byLevel.forEach((item: any) => {
      levelCounts[item._id] = item.count;
    });

    return {
      total,
      byLevel: levelCounts,
      oldestLog: oldest?.timestamp,
      newestLog: newest?.timestamp,
    };
  } catch (error) {
    logger.error(`Error getting log stats: ${error}`);
    return {
      total: 0,
      byLevel: {},
    };
  }
}
