const express = require("express");
const router = express.Router();
const Tour = require("../models/Tour");

// GET /api/tours/search-tags?q=keyword
router.get("/api/tours/keywords", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.json([]);

    // Search for tours that have matching tags (case-insensitive)
    const tours = await Tour.find({
      tags: { $regex: query, $options: "i" }
    }).limit(50).lean();

    // Collect unique matching tags
    const suggestionsSet = new Set();
    tours.forEach(t => {
      t.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestionsSet.add(tag);
        }
      });
    });

    res.json(Array.from(suggestionsSet).slice(0, 10)); // return max 10 suggestions
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
