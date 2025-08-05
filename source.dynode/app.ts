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
require("dotenv").config();

const app = express();
const allowedOrigins = [
  process.env.SOURCE_API_URL, //"http://localhost:3000",
  process.env.RENDER_BASE_URL, //"http://localhost:4000",
  process.env.BUILDER_BASE_URL, //"http://localhost:5000",
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
const PORT = process.env.PORT_ENV || 3000;
const isProduction = process.env.NODE_ENV === "production";
const environment = process.env.NODE_ENV || "development";

// --- MongoDB Connection Setup ---
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/dyna_content";

console.log(`Connecting to ${environment} database...`);
mongoose
  .connect(mongoURI)
  .then(() => console.log("🤖 MongoDB connected successfully!"))
  .catch((err: Error) => {
    console.error("☠️ MongoDB connection error:", err);
    process.exit(1);
  });

if (isProduction) {
  const pfx = fs.readFileSync("./cert/source.dynode.pfx");
  const passphrase = "YourVeryStrongAndSecretPasswordHere";
  https.createServer({ pfx, passphrase }, app).listen(PORT, () => {
    console.log(`🚀 HTTPS server listening at https://localhost:${PORT}/docs`);
    console.log(`🌍 Environment: ${environment}`);
    console.log(`🔒 SSL/TLS: Enabled`);
    console.log(`🗄️ Database: Connected`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}/docs`);
    console.log(`🌍 Environment: ${environment}`);
    console.log(`🔒 SSL/TLS: Disabled`);
    console.log(`🗄️ Database: Connected`);
  });
}
