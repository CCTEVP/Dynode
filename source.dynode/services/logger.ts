import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
require("dotenv");
const logsDestFolder = process.env.SOURCE_LOGS_FOLDER || "../logs";

// Ensure logs directory exists
const logsDir = path.join(__dirname, logsDestFolder);
fs.mkdirSync(logsDir, { recursive: true });

const ORIGIN = "source.dynode"; // or "build.dynode" as needed

const logger = createLogger({
  level: "info",
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
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(logsDir, "%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export default logger;
