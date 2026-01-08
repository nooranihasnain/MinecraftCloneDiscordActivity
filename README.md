# 🎮 Discord Unity Activity (Minecraft-style Project)

This repository contains a **Unity WebGL game running as a Discord Activity**, using the **Discord Embedded App SDK** for authentication and session context.

The project is split into:
- **Unity project** (game)
- **Frontend** (Vite + Unity WebGL host)
- **Backend** (Node.js OAuth token exchange)

---

## 🧱 Project Structure

```text
project-root/
│
├── Assets/                  # Unity game assets
├── Packages/                # Unity packages
├── ProjectSettings/         # Unity project settings
│
├── frontend/                # Vite frontend (Discord Activity shell)
│   ├── public/
│   │   └── unity/           # Unity WebGL build output
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── .env.example
│
├── server/                  # Node.js backend (OAuth token exchange)
│   ├── index.js
│   └── package.json
│
├── sync-env.js              # Syncs safe env vars to frontend
├── .env.example             # Root environment variables template
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

### Root `.env` (single source of truth)

Create a file called `.env` in the **project root**:

```env
DISCORD_CLIENT_ID=YOUR_APPLICATION_ID
DISCORD_CLIENT_SECRET=YOUR_CLIENT_SECRET
DISCORD_REDIRECT_URI=https://YOUR_PUBLIC_ACTIVITY_URL
PORT=3001
```

> ⚠️ **Never commit `.env`** — it contains secrets.

---

### Frontend `.env`
This is **auto-generated** and contains **only public values**.

```env
VITE_DISCORD_CLIENT_ID=YOUR_APPLICATION_ID
```

You do **not** edit this manually.

---

## 🔁 Sync environment variables

After creating or changing the root `.env`:

```bash
node sync-env.js
```

This copies `DISCORD_CLIENT_ID` → `frontend/.env` safely.

---

## 📦 Install dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## ▶️ Running locally (development)

You need **three terminals**.

### 1️⃣ Start backend
```bash
cd server
npm run dev
```

Health check:
```
http://localhost:3001/health
```

---

### 2️⃣ Start frontend
```bash
cd frontend
npm run dev
```

Default:
```
http://localhost:5173
```

---

### 3️⃣ Expose frontend with Cloudflared
Discord Activities require **HTTPS**.

```bash
cloudflared tunnel --url http://localhost:5173
```

You’ll get a URL like:
```
https://example-name.trycloudflare.com
```

Use this URL in:
- `DISCORD_REDIRECT_URI`
- Discord Developer Portal → OAuth2 Redirects
- Discord Developer Portal → Activities → URL Mappings

---

## 🧠 Discord Developer Portal Setup

### General
- Copy **Application ID**
- Copy **Client Secret**

### OAuth2 → Redirects
Add:
```
https://YOUR_CLOUDFLARED_URL
```

### Activities → URL Mappings
| Source | Target |
|------|-------|
| `/`  | `https://YOUR_CLOUDFLARED_URL` |

---

## 🎮 Testing inside Discord

1. Open **Discord Desktop**
2. Join a **voice channel**
3. Click **Activities (🎮 rocket icon)**
4. Start your Activity
5. Unity should load **inside Discord**
6. Discord auth will complete automatically

---

## 🧪 Debugging

### Browser testing
- Frontend runs in **mock mode**
- Discord auth is skipped

### Discord testing
- Auth runs automatically
- Errors are shown **inside the Activity UI**
- You can open DevTools with:
  ```
  Ctrl + Shift + I
  ```

---

## 🏗️ Unity WebGL Notes

- Platform: **WebGL**
- Compression: **Brotli**
- Decompression Fallback: **Enabled**
- Unity WebGL build output is copied into:
  ```
  frontend/public/unity/
  ```

Unity build files are **not committed** (rebuildable).

---

## 🚀 Production Deployment (overview)

- **Frontend**: static hosting (Cloudflare Pages, Netlify, Vercel)
- **Backend**: Node hosting (Railway, Render, Fly.io, etc.)
- Prefer **same domain** with `/api` for backend

Example:
```
https://yourdomain.com/        → frontend
https://yourdomain.com/api    → backend
```

---

## 🔒 Security Notes

- Client Secret **never** goes to frontend
- `.env` files are gitignored
- Only `VITE_` prefixed vars reach browser
- OAuth handled server-side only

---

## 📄 License
Choose your license (MIT, Apache 2.0, proprietary, etc.)

---

## 🤝 Contributing
1. Fork repo
2. Create feature branch
3. Commit changes
4. Open PR

---

## 🧭 Next Steps
- Parse Discord user info in Unity
- Add multiplayer via `instance_id`
- Use voice channel presence
- Publish Activity for public servers
