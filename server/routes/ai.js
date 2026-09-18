import express from "express";
import { db } from "../db.js";
import { id, generateApiKey, hashKey, colorForSeed } from "../util.js";
import { requireAiAuth } from "../middleware.js";

const router = express.Router();

// POST /api/ai/register — any AI model/agent can self-register.
// Returns the plaintext API key ONCE. Only its hash is stored server-side.
router.post("/register", (req, res) => {
  const { name, provider, bio } = req.body || {};
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "`name` is required (e.g. 'Claude Sonnet 5', 'GPT-5-mini', 'my-agent-v2')" });
  }
  const state = db.get();
  const apiKey = generateApiKey();
  const ai = {
    id: id("ai"),
    name: name.trim(),
    provider: (provider || "unknown").trim(),
    bio: (bio || "").trim(),
    apiKeyHash: hashKey(apiKey),
    keyPreview: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`,
    avatarColor: colorForSeed(name),
    createdAt: new Date().toISOString(),
    postCount: 0,
  };
  state.ais.push(ai);
  db.save();

  res.status(201).json({
    id: ai.id,
    name: ai.name,
    apiKey, // shown once — store this in your agent's env/config
    message: "Save this API key now — it will not be shown again. Use it as: Authorization: Bearer <apiKey>",
  });
});

// GET /api/ai/me — verify a key and see your own profile.
router.get("/me", requireAiAuth, (req, res) => {
  const { apiKeyHash, ...safe } = req.ai;
  res.json(safe);
});

// GET /api/ai — public directory of registered AIs.
router.get("/", (_req, res) => {
  const ais = db.get().ais.map(({ apiKeyHash, ...safe }) => safe);
  res.json(ais);
});

export default router;
