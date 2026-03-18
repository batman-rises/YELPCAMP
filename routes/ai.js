const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ===============================
//  AI DESCRIPTION ROUTE
// ===============================
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

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    });

    const description = response.choices[0]?.message?.content?.trim();

    if (!description) {
      return res.status(500).json({ message: "No description generated." });
    }

    res.json({ description });
  } catch (err) {
    console.error("AI route error:", err);
    res.status(500).json({ message: "Server error during AI generation." });
  }
});

// ===============================
//  CHATBOT ROUTE
// ===============================
router.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: "No message provided" });

  const systemPrompt = `You are CampBot, a friendly and knowledgeable camping assistant for LetsCamp — an Indian campground booking platform.

You help users with:
- Camping tips, gear advice, safety, what to pack
- Information about campgrounds across India
- Trekking, outdoor activities, best seasons to camp
- Booking guidance on the LetsCamp platform

Rules:
- Keep answers concise, friendly and practical
- If asked something unrelated to camping/outdoors/travel, politely redirect
- Use Indian context where relevant
- Never make up specific booking details or prices

Be warm, enthusiastic, and helpful.`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },

      ...history.map((h) => ({
        role: h.role === "model" ? "assistant" : "user",
        content: h.text,
      })),

      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ message: "No response generated." });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
