import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root (one level up from /server)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(express.json());

// Serve the built frontend (after you run: cd frontend && npm run build)
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));


// During dev, Vite runs on 5173 and server on 3001.
// If you use Vite proxy (recommended), you can remove cors entirely.
// Keeping it here is fine for now.
app.use(cors({ origin: true }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/token", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const params = new URLSearchParams();
    params.set("client_id", process.env.DISCORD_CLIENT_ID);
    params.set("client_secret", process.env.DISCORD_CLIENT_SECRET);
    params.set("grant_type", "authorization_code");
    params.set("code", code);
    params.set("redirect_uri", process.env.DISCORD_REDIRECT_URI);

    const r = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(400).json({
        error: "Token exchange failed",
        details: data,
      });
    }

    // Return only what the frontend needs
    return res.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token, // optional; you may omit if you don't want refresh
      scope: data.scope,
      token_type: data.token_type,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// SPA fallback: always return index.html for non-API routes
app.get("*", (req, res) => {
  // Don't hijack API routes
  if (req.path.startsWith("/api")) return res.status(404).end();
  res.sendFile(path.join(frontendDist, "index.html"));
});


const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
