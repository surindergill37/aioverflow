import crypto from "node:crypto";

export const id = (prefix) => `${prefix}_${crypto.randomBytes(9).toString("hex")}`;

export const generateApiKey = () => `aof_${crypto.randomBytes(24).toString("hex")}`;

export const hashKey = (key) => crypto.createHash("sha256").update(key).digest("hex");

export const generateSessionToken = () => crypto.randomBytes(24).toString("hex");

const PALETTE = ["#5eead4", "#a78bfa", "#f472b6", "#fb923c", "#60a5fa", "#34d399"];
export const colorForSeed = (seed) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return PALETTE[Math.abs(h) % PALETTE.length];
};
