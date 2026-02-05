// Load environment variables first (before any other imports)
import dotenv from "dotenv";
dotenv.config();

import https from "https";
import fs from "fs";
import os from "os"; // ✅ Added to get hostname
import express from "express";
import path from "path";
import { Request, Response, NextFunction } from "express";
import indexRouter from "./routes/index";
import cacheRouter from "./routes/cache";
import logger from "./services/logger";
import config from "./config";

const app = express();

console.log("indexRouter:", typeof indexRouter);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/cache", cacheRouter); // Cache management API

// Additional imports (converted to ES6)
import createError from "http-errors";
import cookieParser from "cookie-parser";
import loggerMiddleware from "morgan";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(loggerMiddleware("dev"));
app.use(cookieParser());
// Removed duplicate static middleware (already defined above)

// Request logger
app.use(function (req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// Catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// Error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// Server setup
const PORT = config.port;
const HOST = "0.0.0.0"; // ✅ Listen on all interfaces

if (config.https) {
  try {
    const pfx = fs.readFileSync("./cert/render.dynode.pfx");
    https.createServer({ pfx }, app).listen(PORT, HOST, () => {
      const base =
        config.externalOrigins.render ||
        config.externalOrigins.source ||
        `https://${os.hostname()}:${PORT}`; // ✅ Use hostname for friendly access
      console.log(`🚀 HTTPS server listening (env=${config.env}) base=${base}`);
      console.log(`🖥️ Hostname: ${os.hostname()}`);
    });
  } catch (e) {
    console.warn(
      "⚠️ HTTPS startup failed, falling back to HTTP:",
      (e as Error).message
    );
    app.listen(PORT, HOST, () => {
      const base =
        config.externalOrigins.render ||
        config.externalOrigins.source ||
        `http://${os.hostname()}:${PORT}`; // ✅ Use hostname for fallback
      console.log(`🚀 HTTP server listening (env=${config.env}) base=${base}`);
      console.log(`🖥️ Hostname: ${os.hostname()}`);
    });
  }
} else {
  app.listen(PORT, HOST, () => {
    const base =
      config.externalOrigins.render ||
      config.externalOrigins.source ||
      `http://${os.hostname()}:${PORT}`; // ✅ Use hostname for fallback
    console.log(`🚀 HTTP server listening (env=${config.env}) base=${base}`);
    console.log(`🖥️ Hostname: ${os.hostname()}`);
  });
}
