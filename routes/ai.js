const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");

// POST /ai/generate-description
router.post("/ai/generate-description", isLoggedIn, async (req, res) => {
  const { title, location } = req.body;

  if (!title && !location) {
    return res
      .status(400)
      .json({ message: "Provide at least a title or location." });
  }

  try {
    const prompt = `Write a vivid, enticing campground description for a camping site called "${title || "this campground"}" located in "${location || "a beautiful natural setting"}".

The description should:
- Be 2-3 sentences long
- Highlight the natural beauty and unique features of the location
- Use sensory language (sights, sounds, atmosphere)
- Feel warm and inviting to campers
- Sound authentic, not generic

Return only the description text, no quotes, no labels, no markdown.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res
        .status(500)
        .json({ message: "AI generation failed. Please try again." });
    }

    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!description) {
      return res.status(500).json({ message: "No description generated." });
    }

    res.json({ description });
  } catch (err) {
    console.error("AI route error:", err);
    res.status(500).json({ message: "Server error during AI generation." });
  }
});

module.exports = router;
