import { initDiscordAndAuth } from "./discord.js";


const statusEl = document.getElementById("status");
function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

// ---- Unity loader (your working version) ----
const BUILD_NAME = "Build";
const buildUrl = "/unity/Build";
const loaderUrl = `${buildUrl}/${BUILD_NAME}.loader.js`;

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(s);
  });
}

function sendToUnity(method, payloadObj) {
  if (!window.unityInstance) return;
  window.unityInstance.SendMessage(
    "DiscordBridgeReceiver",
    method,
    JSON.stringify(payloadObj)
  );
}

async function loadUnity() {
  setStatus("Loading Unity loader…");
  await loadScript(loaderUrl);

  const canvas = document.getElementById("unity-canvas");

  const config = {
    dataUrl: `${buildUrl}/${BUILD_NAME}.data.unityweb`,
    frameworkUrl: `${buildUrl}/${BUILD_NAME}.framework.js.unityweb`,
    codeUrl: `${buildUrl}/${BUILD_NAME}.wasm.unityweb`,
    streamingAssetsUrl: "unity/StreamingAssets",
    companyName: "YourCompany",
    productName: "Discord Unity Activity",
    productVersion: "0.1.0",
  };

  setStatus("Starting Unity…");
  const unityInstance = await createUnityInstance(canvas, config, (p) => {
    setStatus(`Loading… ${Math.round(p * 100)}%`);
  });

  window.unityInstance = unityInstance;
  setStatus("Unity running ✅");

  setStatus("Initializing Discord auth…");

const result = await initDiscordAndAuth();

if (result.mode === "mock") {
  // Useful during browser testing
  sendToUnity("OnDiscordAuth", {
    mode: "mock",
    note: result.note
  });
  setStatus("Unity ✅ + Discord auth (mock mode in browser)");
} else {
  sendToUnity("OnDiscordAuth", {
    mode: "discord",
    auth: result.auth
  });
  setStatus("Unity ✅ + Discord auth ✅");
}


  return unityInstance;
}

// ---- Boot sequence ----
(async function boot() {
  try {
    await loadUnity();
  } catch (err) {
    console.error(err);
    setStatus("Boot failed ❌ — check console");
  }
})();

