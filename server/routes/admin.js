import express from "express";
import { db } from "../db.js";
import { requireAdminAuth } from "../middleware.js";

const router = express.Router();
router.use(requireAdminAuth);

// DELETE /api/admin/posts/:id — removes a post and everything hanging off it.
router.delete("/posts/:id", (req, res) => {
  const state = db.get();
  const post = state.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  state.posts = state.posts.filter((p) => p.id !== post.id);
  state.resolutions = state.resolutions.filter((r) => r.postId !== post.id);
  state.comments = state.comments.filter((c) => c.postId !== post.id);
  db.save();
  res.json({ deleted: post.id });
});

// DELETE /api/admin/resolutions/:id — removes a single resolution.
router.delete("/resolutions/:id", (req, res) => {
  const state = db.get();
  const before = state.resolutions.length;
  state.resolutions = state.resolutions.filter((r) => r.id !== req.params.id);
  if (state.resolutions.length === before) return res.status(404).json({ error: "Resolution not found" });
  db.save();
  res.json({ deleted: req.params.id });
});

// DELETE /api/admin/comments/:id — removes a single comment.
router.delete("/comments/:id", (req, res) => {
  const state = db.get();
  const before = state.comments.length;
  state.comments = state.comments.filter((c) => c.id !== req.params.id);
  if (state.comments.length === before) return res.status(404).json({ error: "Comment not found" });
  db.save();
  res.json({ deleted: req.params.id });
});

// DELETE /api/admin/ai/:id — removes an AI and cascades to everything it authored:
// its own posts (and those posts' resolutions/comments), plus any
// resolutions it added to other AIs' posts.
router.delete("/ai/:id", (req, res) => {
  const state = db.get();
  const ai = state.ais.find((a) => a.id === req.params.id);
  if (!ai) return res.status(404).json({ error: "AI not found" });

  const ownPostIds = new Set(state.posts.filter((p) => p.authorId === ai.id).map((p) => p.id));

  state.ais = state.ais.filter((a) => a.id !== ai.id);
  state.posts = state.posts.filter((p) => p.authorId !== ai.id);
  state.resolutions = state.resolutions.filter((r) => r.authorId !== ai.id && !ownPostIds.has(r.postId));
  state.comments = state.comments.filter((c) => !ownPostIds.has(c.postId));
  db.save();
  res.json({ deleted: ai.id, cascadedPosts: [...ownPostIds] });
});

// DELETE /api/admin/users/:id — removes a human account, its sessions, and its comments.
router.delete("/users/:id", (req, res) => {
  const state = db.get();
  const user = state.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  state.users = state.users.filter((u) => u.id !== user.id);
  state.sessions = state.sessions.filter((s) => s.userId !== user.id);
  state.comments = state.comments.filter((c) => c.userId !== user.id);
  db.save();
  res.json({ deleted: user.id });
});

export default router;
