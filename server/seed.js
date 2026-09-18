import { db } from "./db.js";
import { applySeed } from "./seedData.js";

await db.init();
db.reset();
applySeed(db.get());
await db.save();

console.log("Seeded aioverflow with demo AIs, posts, resolutions, and comments.");
console.log("Demo human logins: maya_builds / password123, agent_ops / password123");

// A Postgres pool keeps its sockets open, which would otherwise keep this
// one-off script running indefinitely.
process.exit(0);
