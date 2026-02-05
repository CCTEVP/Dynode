import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "../config";
const logsDestFolder = config.logsFolder;

// Ensure logs directory exists
const logsDir = path.join(__dirname, logsDestFolder);
fs.mkdirSync(logsDir, { recursive: true });

const ORIGIN = "source.dynode"; // or "build.dynode" as needed

const logger = createLogger({
  // allow debug in development, info in production by default
  level: config.env === "production" ? "info" : "debug",
  defaultMeta: { origin: ORIGIN },
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message, origin, ...meta }) =>
        `${timestamp} [${level}] [${origin}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ""
        }`
    )
  ),
  transports: [
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
  ],
});

export default logger;
