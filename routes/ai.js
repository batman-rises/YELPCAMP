const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");

router.post("/api/ai/generate-description", isLoggedIn, async (req, res) => {
  const { title, location } = req.body;
  if (!title && !location)
    return res
      .status(400)
      .json({ message: "Provide at least a title or location." });

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
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.8,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Groq API error:", data);
      return res
        .status(500)
        .json({ message: "AI generation failed. Please try again." });
    }

    const description = data.choices?.[0]?.message?.content?.trim();
    if (!description)
      return res.status(500).json({ message: "No description generated." });
    res.json({ description });
  } catch (err) {
    console.error("AI route error:", err);
    res.status(500).json({ message: "Server error during AI generation." });
  }
});

router.post("/api/chat", async (req, res) => {
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
- Use Indian context where relevant (Indian seasons, locations, gear available in India)
- Never make up specific booking details or prices for real campgrounds

Be warm, enthusiastic about the outdoors, and helpful.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Groq chatbot error:", data);
      return res.status(500).json({ message: "Chatbot error. Try again." });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply)
      return res.status(500).json({ message: "No response generated." });
    res.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
