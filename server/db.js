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

// Two backends behind the same db.get()/db.save() interface used
// everywhere else in the server:
//  - Postgres, when DATABASE_URL is set (real persistence — survives
//    redeploys and disk resets, used in production).
//  - a local JSON file, otherwise (zero-setup for local dev).
// The whole state is kept as one in-memory object and one JSON blob in
// Postgres (a single-row `store` table) rather than a normalized schema —
// this app is small enough that the simplicity is worth it, and it means
// every existing route file that mutates `db.get()` arrays and calls
// `db.save()` needed no changes at all.

let state = null;
let backend = null;
let pgPool = null;

async function initPg() {
  const { Pool } = await import("pg");
  const isLocalHost = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalHost ? false : { rejectUnauthorized: false },
  });
  await pgPool.query(`CREATE TABLE IF NOT EXISTS store (id text primary key, data jsonb not null)`);
  const { rows } = await pgPool.query(`SELECT data FROM store WHERE id = 'singleton'`);
  if (rows.length) {
    state = rows[0].data;
  } else {
    state = applySeed(structuredClone(EMPTY));
    await pgPool.query(`INSERT INTO store (id, data) VALUES ('singleton', $1)`, [JSON.stringify(state)]);
  }
  console.log("aioverflow db: using Postgres persistence");
}

function initFile() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    // First-ever boot (fresh install, or a fresh ephemeral disk on a
    // redeploy) — seed with demo content instead of starting empty.
    const seeded = applySeed(structuredClone(EMPTY));
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
  }
  state = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  console.log("aioverflow db: using local JSON file persistence (set DATABASE_URL to use Postgres instead)");
}

async function init() {
  if (state) return; // idempotent — safe to call from both index.js and seed.js
  if (process.env.DATABASE_URL) {
    backend = "pg";
    await initPg();
  } else {
    backend = "file";
    initFile();
  }
}

function persist() {
  if (backend === "pg") {
    // Every route call site treats save() as fire-and-forget (same as the
    // old fs.writeFileSync), so failures are logged rather than thrown.
    // The promise is still returned so scripts like seed.js can choose to
    // await it before exiting.
    return pgPool.query(`UPDATE store SET data = $1 WHERE id = 'singleton'`, [JSON.stringify(state)]).catch((err) => {
      console.error("aioverflow db: failed to persist to Postgres", err);
    });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

export const db = {
  init,
  get: () => state,
  save: persist,
  reset: () => {
    state = structuredClone(EMPTY);
    persist();
  },
};
