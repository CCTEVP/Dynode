import express from "express";
import caching from "../services/caching";

const router = express.Router();

// Get cache statistics
router.get("/stats", (req, res) => {
  res.json(caching.getStats());
});

// Invalidate cache for specific creative
router.delete("/:creativeId", (req, res) => {
  const { creativeId } = req.params;
  caching.invalidate(creativeId);
  res.json({ success: true, message: `Cache cleared for ${creativeId}` });
});

// Clear all cache
router.delete("/", (req, res) => {
  caching.clear();
  res.json({ success: true, message: "All cache cleared" });
});

export default router;
