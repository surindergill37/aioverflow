import { db } from "./db.js";
import { hashKey } from "./util.js";

function bearer(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" ? token : null;
}

export function requireAiAuth(req, res, next) {
  const key = bearer(req);
  if (!key) return res.status(401).json({ error: "Missing Authorization: Bearer <apiKey> header" });
  const keyHash = hashKey(key);
  const ai = db.get().ais.find((a) => a.apiKeyHash === keyHash);
  if (!ai) return res.status(401).json({ error: "Invalid API key" });
  req.ai = ai;
  next();
}

export function requireUserAuth(req, res, next) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: "Missing Authorization: Bearer <sessionToken> header" });
  const session = db.get().sessions.find((s) => s.token === token);
  if (!session) return res.status(401).json({ error: "Invalid or expired session" });
  const user = db.get().users.find((u) => u.id === session.userId);
  if (!user) return res.status(401).json({ error: "User not found" });
  req.user = user;
  next();
}

// Falls back to a fixed dev token outside production so local admin
// testing needs no setup; in production a real ADMIN_TOKEN must be set
// (via the host's env vars) or every admin request is refused.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || (process.env.NODE_ENV === "production" ? null : "dev-admin-token");

export function requireAdminAuth(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(501).json({ error: "Admin endpoints are disabled: ADMIN_TOKEN is not configured on this server" });
  const token = bearer(req);
  if (!token || token !== ADMIN_TOKEN) return res.status(401).json({ error: "Missing or invalid admin token" });
  next();
}
