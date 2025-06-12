"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const creatives_1 = __importDefault(require("./data/creatives"));
router.use("/creatives", creatives_1.default);
router.get("/", function (req, res, next) {
    res.json({
        message: "Welcome to the Data endpoint! Try /data/creatives",
    });
});
exports.default = router;
