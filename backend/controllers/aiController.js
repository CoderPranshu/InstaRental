const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

// Initialize Providers
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const SYSTEM_PROMPT = `
  You are InstaBot, the premium AI assistant for "InstaRental", a peer-to-peer rental marketplace.
  Your goal is to help users rent items or list their own items.
  
  Context about InstaRental:
  - Categories: Furniture, Vehicles, Electronics, Garments, Tools.
  - Process: Browse -> Select Dates -> Pay via Razorpay -> Collect from owner.
  - Features: User profiles, Wishlist, Cart, Vendor Dashboard (to earn money), Admin Dashboard.
  - Support: support@instarental.com, 9am-6pm Mon-Sat.
  
  Guidelines:
  - Be professional, helpful, and friendly.
  - Use emojis occasionally to keep it engaging.
  - If a user asks for specific items, mention that you've found some matches (if suggestions are provided).
  - If you don't know something about a specific order, ask them to check their 'My Bookings' section.
  - Keep responses concise but informative.
`;

/**
 * @desc    Chat with AI (Gemini or Groq)
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chatWithAI = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message' });
  }

  // 1. Keyword search for products
  const keywords = message.toLowerCase().split(' ').filter(w => w.length > 3);
  let suggestions = [];

  if (keywords.length > 0) {
    suggestions = await Product.find({
      $or: [
        { title: { $regex: keywords.join('|'), $options: 'i' } },
        { category: { $regex: keywords.join('|'), $options: 'i' } },
        { description: { $regex: keywords.join('|'), $options: 'i' } }
      ],
      isAvailable: true
    }).limit(4).select('title pricePerDay images _id category');
  }

  // 2. Decide Provider (Default to Groq if key exists, otherwise Gemini)
  const provider = process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : 'gemini');

  try {
    let reply = '';

    if (provider === 'groq' && process.env.GROQ_API_KEY) {
      // Groq Implementation
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        model: 'qwen/qwen3-32b',
      });
      reply = chatCompletion.choices[0].message.content;
    } else {
      // Gemini Implementation
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
          { role: "model", parts: [{ text: "Understood. I am InstaBot, ready to assist users with their rental needs on InstaRental!" }] },
        ],
      });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      reply = response.text();
    }

    // 3. Clean reply (remove <think>...</think> tags if present)
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    res.json({ reply, suggestions });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({
      reply: `⚠️ I'm having trouble connecting to my brain (${provider}). Please check your API keys!`,
      suggestions: []
    });
  }
});

module.exports = { chatWithAI };


