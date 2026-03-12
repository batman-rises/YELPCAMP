const express = require("express");
const router = require("express").Router();
const { isLoggedIn } = require("../middleware");

// POST /api/ai/generate-description
router.post("/ai/generate-description", isLoggedIn, async (req, res) => {
  const { title, location } = req.body;

  if (!title && !location) {
    return res
      .status(400)
      .json({ message: "Provide at least a title or location." });
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-fast",
        max_tokens: 300,
        temperature: 0.8,
        messages: [
          {
            role: "user",
            content: `Write a vivid, enticing campground description for a camping site called "${title || "this campground"}" located in "${location || "a beautiful natural setting"}".

The description should:
- Be 2-3 sentences long
- Highlight the natural beauty and unique features of the location
- Use sensory language (sights, sounds, atmosphere)
- Feel warm and inviting to campers
- Sound authentic, not generic

Return only the description text, no quotes, no labels, no markdown.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Grok API error:", data);
      return res
        .status(500)
        .json({ message: "AI generation failed. Please try again." });
    }

    const description = data.choices?.[0]?.message?.content?.trim();

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
