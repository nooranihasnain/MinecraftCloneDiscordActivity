import { DiscordSDK } from "@discord/embedded-app-sdk";

function isProbablyInDiscord() {
  const params = new URLSearchParams(window.location.search);
  return params.has("frame_id") || params.has("instance_id") || params.has("platform");
}

export async function initDiscordAndAuth() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  if (!clientId) throw new Error("Missing VITE_DISCORD_CLIENT_ID in .env");

  // Browser-tab dev fallback
  if (!isProbablyInDiscord()) {
    return {
      mode: "mock",
      discordSdk: null,
      auth: null,
      note: "Not inside Discord. Skipping authorize/authenticate."
    };
  }

  const discordSdk = new DiscordSDK(clientId);
  await discordSdk.ready();

  // 1) Get OAuth code from Discord client
  const { code } = await discordSdk.commands.authorize({
    client_id: clientId,
    response_type: "code",
    prompt: "none",
    scope: ["identify"],
    state: ""
  });

  // 2) Exchange code on YOUR server
  const tokenRes = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });

  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenJson)}`);
  }

  // 3) Authenticate with Discord Embedded SDK
  const auth = await discordSdk.commands.authenticate({
    access_token: tokenJson.access_token
  });

  return { mode: "discord", discordSdk, auth };
}
