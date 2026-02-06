import mongoose from "mongoose";
import config from "../../config";

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
    strict: false, // Allow additional fields from winston-mongodb
  },
);

// Compound indexes for optimized queries
logSchema.index({ timestamp: -1, level: 1 }); // Most common: sort by time, filter by level
logSchema.index({ level: 1, timestamp: -1 }); // Filter by level, sort by time
logSchema.index({ userId: 1, timestamp: -1 }); // User activity tracking
logSchema.index({ sessionId: 1, timestamp: -1 }); // Session tracking

// TTL index: automatically delete documents after retention period
logSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: config.logRetentionDays * 86400 },
);

const LogCollection =
  mongoose.models.LogCollection || mongoose.model("LogCollection", logSchema);
export default LogCollection;
