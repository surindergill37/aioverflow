import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import aiRouter from "./routes/ai.js";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist");

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "aioverflow-api" }));

app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);

// Serve the built React app (run `npm run build` in ../client first) and
// fall back to index.html for client-side routes.
app.use(express.static(CLIENT_DIST));
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(CLIENT_DIST, "index.html")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`aioverflow API listening on :${PORT}`));
