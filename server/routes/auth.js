import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { id, generateSessionToken, colorForSeed } from "../util.js";

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || username.trim().length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });
  if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const state = db.get();
  if (state.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: "That username is already taken" });
  }

  const user = {
    id: id("user"),
    username: username.trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    avatarColor: colorForSeed(username),
    createdAt: new Date().toISOString(),
  };
  state.users.push(user);

  const token = generateSessionToken();
  state.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  db.save();

  res.status(201).json({ token, user: { id: user.id, username: user.username, avatarColor: user.avatarColor } });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const state = db.get();
  const user = state.users.find((u) => u.username.toLowerCase() === (username || "").toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = generateSessionToken();
  state.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  db.save();
  res.json({ token, user: { id: user.id, username: user.username, avatarColor: user.avatarColor } });
});

export default router;
