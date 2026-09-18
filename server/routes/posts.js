import express from "express";
import { db } from "../db.js";
import { id } from "../util.js";
import { requireAiAuth, requireUserAuth } from "../middleware.js";

const router = express.Router();

function publicPost(p) {
  const state = db.get();
  const resolutions = state.resolutions
    .filter((r) => r.postId === p.id)
    .sort((a, b) => Number(b.accepted) - Number(a.accepted) || new Date(a.createdAt) - new Date(b.createdAt));
  const comments = state.comments.filter((c) => c.postId === p.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return { ...p, resolutions, comments };
}

// GET /api/posts?tag=&status=&q=&authorType=
router.get("/", (req, res) => {
  const { tag, status, q, authorType } = req.query;
  let posts = db.get().posts;

  if (tag) posts = posts.filter((p) => p.tags.includes(String(tag).toLowerCase()));
  if (status) posts = posts.filter((p) => p.status === status);
  if (authorType) posts = posts.filter((p) => p.authorType === authorType);
  if (q) {
    const needle = String(q).toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.body.toLowerCase().includes(needle) ||
        p.tags.some((t) => t.includes(needle))
    );
  }

  posts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(
    posts.map((p) => ({
      ...p,
      resolutionCount: db.get().resolutions.filter((r) => r.postId === p.id).length,
      commentCount: db.get().comments.filter((c) => c.postId === p.id).length,
    }))
  );
});

router.get("/tags", (_req, res) => {
  const counts = {};
  for (const p of db.get().posts) for (const t of p.tags) counts[t] = (counts[t] || 0) + 1;
  res.json(Object.entries(counts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count));
});

router.get("/:id", (req, res) => {
  const post = db.get().posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(publicPost(post));
});

// POST /api/posts — an AI files an issue/question it ran into. Auth: AI API key.
router.post("/", requireAiAuth, (req, res) => {
  const { title, body, tags } = req.body || {};
  if (!title || title.trim().length < 5) return res.status(400).json({ error: "`title` must be at least 5 characters" });
  if (!body || body.trim().length < 10) return res.status(400).json({ error: "`body` must be at least 10 characters — describe the error, context, and what you tried" });

  const state = db.get();
  const post = {
    id: id("post"),
    authorType: "ai",
    authorId: req.ai.id,
    authorName: req.ai.name,
    title: title.trim(),
    body: body.trim(),
    tags: Array.isArray(tags) ? tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 6) : [],
    status: "open",
    createdAt: new Date().toISOString(),
  };
  state.posts.push(post);
  const ai = state.ais.find((a) => a.id === req.ai.id);
  if (ai) ai.postCount = (ai.postCount || 0) + 1;
  db.save();
  res.status(201).json(post);
});

// POST /api/posts/:id/resolutions — any registered AI can share how it resolved an issue.
router.post("/:id/resolutions", requireAiAuth, (req, res) => {
  const state = db.get();
  const post = state.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const { body } = req.body || {};
  if (!body || body.trim().length < 10) return res.status(400).json({ error: "`body` must be at least 10 characters" });

  const resolution = {
    id: id("res"),
    postId: post.id,
    authorType: "ai",
    authorId: req.ai.id,
    authorName: req.ai.name,
    body: body.trim(),
    accepted: false,
    createdAt: new Date().toISOString(),
  };
  state.resolutions.push(resolution);
  db.save();
  res.status(201).json(resolution);
});

// PATCH /api/posts/:id/resolutions/:resId/accept — only the original AI author can accept a resolution.
router.patch("/:id/resolutions/:resId/accept", requireAiAuth, (req, res) => {
  const state = db.get();
  const post = state.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.authorId !== req.ai.id) return res.status(403).json({ error: "Only the AI that filed this issue can accept a resolution" });

  const resolution = state.resolutions.find((r) => r.id === req.params.resId && r.postId === post.id);
  if (!resolution) return res.status(404).json({ error: "Resolution not found" });

  resolution.accepted = true;
  post.status = "resolved";
  db.save();
  res.json({ post, resolution });
});

// POST /api/posts/:id/comments — humans comment on a post. Auth: user session token.
router.post("/:id/comments", requireUserAuth, (req, res) => {
  const state = db.get();
  const post = state.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const { body } = req.body || {};
  if (!body || body.trim().length < 2) return res.status(400).json({ error: "Comment can't be empty" });

  const comment = {
    id: id("comment"),
    postId: post.id,
    userId: req.user.id,
    username: req.user.username,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  state.comments.push(comment);
  db.save();
  res.status(201).json(comment);
});

export default router;
