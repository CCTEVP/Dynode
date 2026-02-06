import fs from "fs";
import path from "path";
import os from "os";
import mongoose from "mongoose";
import { createLogger, format, transports } from "winston";
import Transport from "winston-transport";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "../config";
const logsDestFolder = config.logsFolder;

// Ensure logs directory exists
const logsDir = path.join(__dirname, logsDestFolder);
fs.mkdirSync(logsDir, { recursive: true });

const ORIGIN = "source.dynode"; // or "build.dynode" as needed

// Build transports array
const logTransports: any[] = [
  // console: show debug messages (and above) — useful for development only
  new transports.Console({
    level: config.env === "production" ? "info" : "debug",
  }),
  // file: persist info and above (debug will not be written to files)
  new DailyRotateFile({
    level: config.env === "production" ? "info" : "debug",
    filename: path.join(logsDir, "%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "14d",
  }),
];

// Separate MongoDB connection for logs
let logDbConnection: mongoose.Connection | null = null;
let LogCollectionModel: mongoose.Model<any> | null = null;

// Initialize log database connection if DB logging is enabled
if (config.enableDbLogging) {
  const logDbUri = config.logDbUri || config.mongoUri;
  console.log(`[Logger] Initializing log DB connection to: ${logDbUri}`);

  logDbConnection = mongoose.createConnection(logDbUri, {
    autoIndex: false,
  });

  logDbConnection.on("connected", async () => {
    console.log("[Logger] Log DB connected successfully");

    // Create the LogCollection schema directly
    const logSchema = new mongoose.Schema(
      {
        level: {
          type: String,
          required: true,
          enum: ["error", "warn", "info", "http", "verbose", "debug"],
          index: true,
        },
        message: { type: String, required: true },
        timestamp: { type: Date, required: true },
        hostname: { type: String },
        origin: { type: String },
        userId: { type: String, index: true },
        sessionId: { type: String, index: true },
        metadata: { type: mongoose.Schema.Types.Mixed },
      },
      {
        collection: "logs",
        timestamps: false,
        versionKey: false,
        strict: false,
      },
    );

    // Add indexes
    logSchema.index({ timestamp: -1, level: 1 });
    logSchema.index({ level: 1, timestamp: -1 });
    logSchema.index({ userId: 1, timestamp: -1 });
    logSchema.index({ sessionId: 1, timestamp: -1 });
    logSchema.index(
      { timestamp: 1 },
      { expireAfterSeconds: config.logRetentionDays * 86400 },
    );

    LogCollectionModel = logDbConnection!.model("LogCollection", logSchema);
    console.log(
      "[Logger] LogCollection model registered on log DB (dyna_stats)",
    );
  });

  logDbConnection.on("error", (err) => {
    console.error("[Logger] Log DB connection error:", err);
  });

  logDbConnection.on("disconnected", () => {
    console.warn("[Logger] Log DB disconnected");
  });
}

// Custom MongoDB Transport with buffering
class MongoDBTransport extends Transport {
  private logBuffer: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 10; // Flush after 10 logs
  private readonly FLUSH_INTERVAL = 5000; // Flush every 5 seconds

  constructor(opts?: any) {
    super(opts);
    console.log("[MongoDBTransport] Initializing MongoDB transport");
    this.startFlushTimer();
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      console.log(
        `[MongoDBTransport] Timer flush triggered, buffer size: ${this.logBuffer.length}`,
      );
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  private async flush() {
    if (this.logBuffer.length === 0) return;

    console.log(
      `[MongoDBTransport] Flushing ${this.logBuffer.length} logs to MongoDB`,
    );

    // Check if log DB connection is ready
    if (!logDbConnection) {
      console.warn(
        "[MongoDBTransport] Log DB connection not initialized, skipping flush",
      );
      return;
    }

    const connectionState = logDbConnection.readyState;
    console.log(
      `[MongoDBTransport] Log DB connection state: ${connectionState} (1=connected)`,
    );

    if (connectionState !== 1) {
      console.warn("[MongoDBTransport] Log DB not connected, skipping flush");
      return;
    }

    if (!LogCollectionModel) {
      console.warn(
        "[MongoDBTransport] LogCollection model not ready, skipping flush",
      );
      return;
    }

    const logsToSave = [...this.logBuffer];
    this.logBuffer = [];

    try {
      console.log(
        `[MongoDBTransport] Inserting ${logsToSave.length} logs into dyna_stats collection`,
      );
      const result = await LogCollectionModel.insertMany(logsToSave, {
        ordered: false,
      });
      console.log(
        `[MongoDBTransport] Successfully inserted ${result.length} logs to dyna_stats`,
      );
    } catch (error) {
      console.error(
        "[MongoDBTransport] Failed to flush logs to dyna_stats:",
        error,
      );
      // Put logs back in buffer if they failed
      this.logBuffer.unshift(...logsToSave);
    }
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const { level, message, timestamp, origin, userId, sessionId, ...rest } =
      info;

    // Create the exact structure: timestamp and hostname at root, metadata for extras
    const logDoc: any = {
      level,
      message,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      hostname: os.hostname(),
    };

    // Only add optional fields if they exist
    if (origin) logDoc.origin = origin;
    if (userId) logDoc.userId = userId;
    if (sessionId) logDoc.sessionId = sessionId;

    // Only add metadata if there are extra fields
    if (Object.keys(rest).length > 0) {
      logDoc.metadata = rest;
    }

    this.logBuffer.push(logDoc);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.BUFFER_SIZE) {
      this.flush();
    }

    callback();
  }

  close() {
    console.log(
      "[MongoDBTransport] Closing transport and flushing remaining logs",
    );
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Add MongoDB transport if enabled
if (config.enableDbLogging) {
  console.log("[Logger] DB logging enabled, adding MongoDB transport");
  logTransports.push(new MongoDBTransport());
} else {
  console.log("[Logger] DB logging disabled");
}

const logger = createLogger({
  // allow debug in development, info in production by default
  level: config.env === "production" ? "info" : "debug",
  defaultMeta: { origin: ORIGIN },
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message, origin, userId, sessionId, ...meta }) => {
        const userInfo = userId ? `[user:${userId}]` : "";
        const sessionInfo = sessionId ? `[session:${sessionId}]` : "";
        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : "";
        return `${timestamp} [${level}] [${origin}]${userInfo}${sessionInfo}: ${message}${metaStr}`;
      },
    ),
  ),
  transports: logTransports,
});

/**
 * Create a child logger with session and user context
 * @param sessionId - Unique session identifier
 * @param userId - User identifier (optional)
 */
export function createContextLogger(sessionId?: string, userId?: string) {
  return logger.child({
    sessionId,
    userId,
  });
}

// Ensure logs are flushed before process exits
if (config.enableDbLogging) {
  const gracefulShutdown = async () => {
    logger.close();
    if (logDbConnection) {
      await logDbConnection.close();
      console.log("[Logger] Log DB connection closed");
    }
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
  process.on("exit", gracefulShutdown);
}

/**
 * Get the LogCollection model connected to the log database
 * Used by the GET /files/log endpoint to query the correct database
 */
export function getLogCollectionModel() {
  return LogCollectionModel;
}

export default logger;
