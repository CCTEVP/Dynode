"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.post("/", (req, res, next) => {
    const { username, password } = req.body;
    // Replace this with your real user validation
    if (username === "admin" && password === "password") {
        const user = { username };
        const token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        return res.json({ token });
    }
    res.status(401).json({ message: "Invalid credentials" });
});
exports.default = router;
