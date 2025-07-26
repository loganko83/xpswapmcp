import { Router } from "express";
import { cache } from "../services/cache.js";

const router = Router();

// Get cache statistics
router.get("/cache/stats", async (req, res) => {
  try {
    const stats = cache.getStats();
    res.json({
      success: true,
      stats: {
        ...stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get cache statistics" 
    });
  }
});

// Clear cache (admin only - in production, add authentication)
router.post("/cache/clear", async (req, res) => {
  try {
    cache.clear();
    res.json({
      success: true,
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to clear cache" 
    });
  }
});

export default router;
