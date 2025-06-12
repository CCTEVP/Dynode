"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/dataApi.js
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
var mongoose = require("mongoose");
// --- Mongoose Schema and Models ---
// NEW: Schema and Model for 'Creative' based on the 'creatives_unified' view
// The second argument in mongoose.model is the collection/view name.
// Mongoose will automatically use this name if provided, or pluralize the model name.
// Explicitly providing it ensures it connects to your view.
const creativeSchema = new mongoose.Schema({
    // Define the fields you expect from your 'creatives_unified' view
    // For demonstration, assuming some basic fields. Adjust these to match your view's actual structure.
    creativeId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String },
    campaignName: { type: String },
    // Add other fields present in your 'creatives_unified' view
}, {
    collection: "creatives_unified", // Explicitly specify the view/collection name
    timestamps: true, // Add createdAt and updatedAt fields automatically if you want
});
const Creative = mongoose.model("Creative", creativeSchema);
// --- End Mongoose Schema and Models ---
// --- API Routes ---
/**
 * @swagger
 * /data/creatives:
 *   get:
 *     summary: Retrieve a list of creative documents from the 'creatives_unified' view.
 *     tags: [Creatives]
 *     description: Fetches all documents from the 'creatives_unified' MongoDB view.
 *     responses:
 *       200:
 *         description: A list of creative documents.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The document ID.
 *                   creativeId:
 *                     type: string
 *                     description: Unique ID for the creative.
 *                   title:
 *                     type: string
 *                     description: The title of the creative.
 *                   type:
 *                     type: string
 *                     description: The type of creative (e.g., "image", "video").
 *                   campaignName:
 *                     type: string
 *                     description: The name of the campaign this creative belongs to.
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the document was created.
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the document was last updated.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve creatives."
 */
router.get("/", async (req, res, next) => {
    try {
        // Find all documents in the 'creatives_unified' view
        const creatives = await Creative.find({});
        res.json(creatives);
    }
    catch (error) {
        console.error("Error fetching creatives from MongoDB view:", error);
        res.status(500).json({ message: "Failed to retrieve creatives." });
    }
});
router.get("/", async function (req, res, next) {
    try {
        // Find all documents in the 'creatives_unified' view
        const creatives = await Creative.find({});
        res.json(creatives);
    }
    catch (error) {
        console.error("Error fetching creatives from MongoDB view:", error);
        res.status(500).json({ message: "Failed to retrieve creatives." });
    }
});
/**
 * @swagger
 * /data/creatives:
 *   put:
 *     summary: Placeholder for updating creatives.
 *     tags: [Creatives]
 *     responses:
 *       200:
 *         description: Placeholder response.
 */
router.put("/", async function (req, res, next) {
    res.json({
        message: "This is a placeholder for PUT requests to /data/creatives. Implement your logic here.",
    });
});
/**
 * @swagger
 * /data/creatives:
 *   post:
 *     summary: Placeholder for creating a creative.
 *     tags: [Creatives]
 *     responses:
 *       200:
 *         description: Placeholder response.
 */
router.post("/", async function (req, res, next) {
    res.json({
        message: "This is a placeholder for POST requests to /data/creatives. Implement your logic here.",
    });
});
/**
 * @swagger
 * /data/creatives:
 *   delete:
 *     summary: Placeholder for deleting creatives.
 *     tags: [Creatives]
 *     responses:
 *       200:
 *         description: Placeholder response.
 */
router.delete("/", async function (req, res, next) {
    res.json({
        message: "This is a placeholder for DELETE requests to /data/creatives. Implement your logic here.",
    });
});
// --- End API Routes ---
// Export the router for use in app.js
exports.default = router;
