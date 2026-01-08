// sync-env.js (CommonJS – no warnings, works everywhere)

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Always resolve from project root
const rootDir = __dirname;

// Read root .env
const rootEnvPath = path.join(rootDir, ".env");

if (!fs.existsSync(rootEnvPath)) {
  console.error("❌ Root .env not found at:", rootEnvPath);
  process.exit(1);
}

const rootEnv = dotenv.parse(fs.readFileSync(rootEnvPath));

const clientId = rootEnv.DISCORD_CLIENT_ID;
if (!clientId) {
  console.error("❌ DISCORD_CLIENT_ID missing in root .env");
  process.exit(1);
}

// Write frontend .env
const frontendEnvPath = path.join(rootDir, "frontend", ".env");
const frontendEnv = `VITE_DISCORD_CLIENT_ID=${clientId}\n`;

fs.writeFileSync(frontendEnvPath, frontendEnv);

console.log("✅ Synced frontend/.env from root .env");
