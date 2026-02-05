// Load environment variables first (before any other imports)
import dotenv from "dotenv";
dotenv.config();

import https from "https";
import fs from "fs";
import { RequestHandler } from "express";
import { authenticateToken } from "./middleware/auth";
import express from "express";
import { Request, Response, NextFunction } from "express";
import indexRouter from "./routes/index";
import dataRouter from "./routes/data/default";
import filesRouter from "./routes/files/default";
import swaggerRouter from "./routes/swagger";
import loginRouter from "./routes/login";
import authRouter from "./routes/auth";
import logger from "./services/logger";
import cors from "cors";
import config from "./config";

const app = express();
// Allowed origins now derived from a single config switch
const allowedOrigins = config.allowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false, // Set to true if you need cookies/auth
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);
//app.use("/data", authenticateToken as RequestHandler, dataRouter);
//app.use("/files", authenticateToken as RequestHandler, filesRouter);
app.use("/data", dataRouter); // Removed authentication for dataRouter
app.use("/files", filesRouter); // Removed authentication for filesRouter
app.use("/docs", swaggerRouter);
app.use("/login", loginRouter);
app.use("/auth", authRouter);

// Additional imports (converted to ES6)
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import loggerMiddleware from "morgan";
import mongoose from "mongoose"; // Import mongoose for MongoDB connection

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(loggerMiddleware("dev"));
// Removed duplicate middleware (already defined on lines 37-38)
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// request logger middleware
app.use(function (req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
const PORT = config.port;
const environment = config.env;
const isProduction = config.env === "production";

// --- MongoDB Connection Setup with Retry ---
const mongoURI = config.mongoUri;
const cacheMongoURI = config.cacheMongoUri;
const MAX_MONGO_RETRIES = 10; // keep static (no process.env dependency per project direction)
const RETRY_DELAY_MS = 3000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function connectWithRetry(attempt = 1): Promise<void> {
  console.log(
    `🔌 Connecting to MongoDB (attempt ${attempt}/${MAX_MONGO_RETRIES}) -> ${mongoURI}`,
  );
  try {
    await mongoose.connect(mongoURI, { autoIndex: false });
    console.log(`🤖 MongoDB connected (${environment})`);
  } catch (err) {
    console.error(
      `☠️ MongoDB connection error (attempt ${attempt}):`,
      err instanceof Error ? err.message : err,
    );
    if (attempt >= MAX_MONGO_RETRIES) {
      console.error(
        `💥 Failed to connect to Mongo after ${MAX_MONGO_RETRIES} attempts. Exiting.`,
      );
      process.exit(1);
    } else {
      await sleep(RETRY_DELAY_MS);
      return connectWithRetry(attempt + 1);
    }
  }
}

async function connectCacheWithRetry(
  attempt = 1,
): Promise<mongoose.Connection> {
  console.log(
    `🔌 Connecting to Cache MongoDB (attempt ${attempt}/${MAX_MONGO_RETRIES}) -> ${cacheMongoURI}`,
  );
  try {
    const connection = mongoose.createConnection(cacheMongoURI, {
      autoIndex: false,
    });
    await connection.asPromise();
    console.log(`🗄️ Cache MongoDB connected (${environment})`);
    return connection;
  } catch (err) {
    console.error(
      `☠️ Cache MongoDB connection error (attempt ${attempt}):`,
      err instanceof Error ? err.message : err,
    );
    if (attempt >= MAX_MONGO_RETRIES) {
      console.error(
        `💥 Failed to connect to Cache Mongo after ${MAX_MONGO_RETRIES} attempts. Exiting.`,
      );
      process.exit(1);
    } else {
      await sleep(RETRY_DELAY_MS);
      return connectCacheWithRetry(attempt + 1);
    }
  }
}

// Export cache connection and BufferCollection for use in services/routes
export let cacheConnection: mongoose.Connection;
export let BufferCollection: mongoose.Model<any>;

function startHttpServers() {
  // Simple HTTPS toggle based on production & config.https flag
  if (isProduction && config.https) {
    try {
      const pfx = fs.readFileSync("./cert/source.dynode.pfx");
      https.createServer({ pfx }, app).listen(PORT, () => {
        const base = config.externalOrigins.source || `https://0.0.0.0:${PORT}`;
        console.log(
          `🚀 HTTPS server listening (env=${environment}) base=${base} docs=/docs`,
        );
        console.log(`🔒 SSL/TLS: Enabled`);
        console.log(`🗄️ Database: Connected`);
      });
    } catch (e) {
      console.warn(
        "⚠️ Failed to start HTTPS (falling back to HTTP):",
        (e as Error).message,
      );
      app.listen(PORT, () => {
        const base = config.externalOrigins.source || `http://0.0.0.0:${PORT}`;
        console.log(
          `🚀 HTTP server listening (env=${environment}) base=${base} docs=/docs`,
        );
        console.log(`🔒 SSL/TLS: Disabled`);
        console.log(`🗄️ Database: Connected`);
      });
    }
  } else {
    app.listen(PORT, () => {
      const base = config.externalOrigins.source || `http://0.0.0.0:${PORT}`;
      console.log(
        `🚀 HTTP server listening (env=${environment}) base=${base} docs=/docs`,
      );
      console.log(`🔒 SSL/TLS: Disabled`);
      console.log(`🗄️ Database: Connected`);
    });
  }
}

async function bootstrap() {
  await connectWithRetry();
  cacheConnection = await connectCacheWithRetry();

  // Initialize BufferCollection model with cache connection
  const bufferCollectionSchema = (
    await import("./models/collections/BufferCollection")
  ).default;
  BufferCollection = cacheConnection.model(
    "BufferCollection",
    bufferCollectionSchema,
  );

  startHttpServers();
  console.log("🔧 Active config (summary):", {
    env: config.env,
    port: config.port,
    origins: allowedOrigins,
    https: isProduction && config.https,
  });
}

bootstrap().catch((e) => {
  console.error("Unexpected bootstrap failure:", e);
  process.exit(1);
});
