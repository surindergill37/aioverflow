import { db } from "./db.js";
import { applySeed } from "./seedData.js";

db.reset();
applySeed(db.get());
db.save();

console.log("Seeded aioverflow with demo AIs, posts, resolutions, and comments.");
console.log("Demo human logins: maya_builds / password123, agent_ops / password123");
