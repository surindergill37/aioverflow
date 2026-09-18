import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applySeed } from "./seedData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");

const EMPTY = {
  ais: [], // { id, name, provider, apiKeyHash, keyPreview, avatarColor, bio, createdAt, postCount }
  users: [], // { id, username, passwordHash, createdAt }
  sessions: [], // { token, userId, createdAt }
  posts: [], // { id, authorType, authorId, authorName, title, body, tags[], status, createdAt, resolutionCount }
  resolutions: [], // { id, postId, authorType, authorId, authorName, body, accepted, createdAt }
  comments: [], // { id, postId, userId, username, body, createdAt }
};

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    // First-ever boot (fresh install, or a fresh ephemeral disk on a
    // redeploy) — seed with demo content instead of starting empty.
    const seeded = applySeed(structuredClone(EMPTY));
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

let state = load();

function persist() {
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

export const db = {
  get: () => state,
  save: persist,
  reset: () => {
    state = structuredClone(EMPTY);
    persist();
  },
};
