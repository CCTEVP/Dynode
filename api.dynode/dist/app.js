"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("./middleware/auth");
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const data_1 = __importDefault(require("./routes/data"));
const files_1 = __importDefault(require("./routes/files"));
const swagger_1 = __importDefault(require("./routes/swagger"));
const login_1 = __importDefault(require("./routes/login"));
const app = (0, express_1.default)();
console.log("indexRouter:", typeof index_1.default);
console.log("dataRouter:", typeof data_1.default);
console.log("filesRouter:", typeof files_1.default);
console.log("swaggerRouter:", typeof swagger_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use("/", index_1.default);
app.use("/data", auth_1.authenticateToken, data_1.default);
app.use("/files", auth_1.authenticateToken, files_1.default);
app.use("/docs", swagger_1.default);
app.use("/login", login_1.default);
// Load environment variables from .env file
// This line should be at the very top of your app.js
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose"); // Import mongoose for MongoDB connection
require("dotenv").config();
// --- MongoDB Connection Setup ---
// Use the MongoDB URI from environment variables
// It falls back to a default local URI if MONGO_URI is not set (e.g., in a test environment)
const mongoURI = process.env.MONGO_URI;
console.log(mongoURI); // This will show 'undefined' if process.env.MONGO_URI is undefined, or the fallback.
mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => console.error("MongoDB connection error:", err));
// --- End MongoDB Connection Setup ---
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express_1.default.static(path.join(__dirname, "public")));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
});
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === "development") {
    const pfx = fs_1.default.readFileSync("./localhost.pfx");
    const passphrase = "password"; // The password you used in PowerShell
    https_1.default.createServer({ pfx, passphrase }, app).listen(PORT, () => {
        console.log(`🚀 HTTPS server listening at https://localhost:${PORT}`);
    });
}
else {
    app.listen(PORT, () => {
        console.log(`🚀 Server listening at http://localhost:${PORT}`);
    });
}
