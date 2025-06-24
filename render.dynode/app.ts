import https from "https";
import fs from "fs";
import express from "express";
import { Request, Response, NextFunction } from "express";
import indexRouter from "./routes/index";
import dynamicsRouter from "./routes/dynamics/default";

import logger from "./services/logger";

const app = express();

console.log("indexRouter:", typeof indexRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);
app.use("/dynamics", dynamicsRouter);

// Load environment variables from .env file
// This line should be at the very top of your app.js
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var loggerMiddleware = require("morgan");

require("dotenv").config();

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
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "development") {
  const pfx = fs.readFileSync("./cert/api.dynode.pfx");
  const passphrase = "password"; // The password you used in PowerShell
  https.createServer({ pfx, passphrase }, app).listen(PORT, () => {
    console.log(`🚀 HTTPS server listening at https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
  });
}
