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
import logger from "./services/logger";
import cors from "cors";

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5000",
];

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
  })
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

// Load environment variables from .env file
// This line should be at the very top of your app.js
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var loggerMiddleware = require("morgan");
var mongoose = require("mongoose"); // Import mongoose for MongoDB connection

require("dotenv").config();
// --- MongoDB Connection Setup ---
// Use the MongoDB URI from environment variables
// It falls back to a default local URI if MONGO_URI is not set (e.g., in a test environment)
const mongoURI = process.env.MONGO_URI;
console.log(mongoURI); // This will show 'undefined' if process.env.MONGO_URI is undefined, or the fallback.
mongoose
  .connect(mongoURI)
  .then(() => console.log("🤖 MongoDB connected successfully!"))
  .catch((err: Error) => console.error("☠️ MongoDB connection error:", err));
// --- End MongoDB Connection Setup ---

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(loggerMiddleware("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "development") {
  const pfx = fs.readFileSync("./cert/source.dynode.pfx");
  const passphrase = "YourVeryStrongAndSecretPasswordHere"; // The password you used in PowerShell
  https.createServer({ pfx, passphrase }, app).listen(PORT, () => {
    console.log(`🚀 HTTPS server listening at https://localhost:${PORT}/docs`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}/docs`);
  });
}
