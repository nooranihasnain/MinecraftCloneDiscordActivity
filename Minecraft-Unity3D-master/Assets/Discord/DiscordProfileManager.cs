using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class DiscordProfileManager : MonoBehaviour
{
    [Header("References")]
    public TMP_Text usernameText;
    public RawImage avatarImage;

    [Header("Avatar Settings")]
    [Range(64, 1024)]
    public int avatarSize = 128;          // 64/128/256/512/1024 recommended
    public bool preferWebp = true;        // Discord CDN is very reliable with webp

    // Cache to avoid re-downloading unnecessarily
    private string _lastAvatarUrl;

    public void UpdateProfile()
    {
        Debug.Log("DiscordProfileManager: Updating Discord profile UI.");

        var user = DiscordSessionManager.Instance.CurrentUser;
        if (user == null)
        {
            usernameText.text = "";
            Debug.LogError("No Discord user is currently set.");
            return;
        }

        // Username
        usernameText.text = user.username;

        // Avatar
        string avatarUrl = BuildAvatarUrl(user.id, user.avatar);
        Debug.Log($"Avatar URL: {avatarUrl}");

        if (avatarUrl != _lastAvatarUrl)
        {
            _lastAvatarUrl = avatarUrl;
            StartCoroutine(LoadAvatarIntoRawImage(avatarUrl));
        }
    }

    private string BuildAvatarUrl(string userId, string avatarHash)
    {
        // If user has no custom avatar, use a default
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(avatarHash))
            return "https://cdn.discordapp.com/embed/avatars/0.png";

        string ext = preferWebp ? "webp" : "png";
        return $"https://cdn.discordapp.com/avatars/{userId}/{avatarHash}.{ext}?size={avatarSize}";
    }

    private IEnumerator LoadAvatarIntoRawImage(string url)
    {
        if (avatarImage == null)
        {
            Debug.LogWarning("avatarImage is not assigned.");
            yield break;
        }

        using (var req = UnityWebRequestTexture.GetTexture(url))
        {
            yield return req.SendWebRequest();

            if (req.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"Avatar download failed: {req.error} | URL: {url}");

                // If webp failed, retry png once
                if (preferWebp && url.Contains(".webp"))
                {
                    string pngUrl = url.Replace(".webp", ".png");
                    Debug.Log("Retrying avatar as PNG: " + pngUrl);

                    using (var req2 = UnityWebRequestTexture.GetTexture(pngUrl))
                    {
                        yield return req2.SendWebRequest();
                        if (req2.result != UnityWebRequest.Result.Success)
                        {
                            Debug.LogError($"PNG retry failed: {req2.error} | URL: {pngUrl}");
                            yield break;
                        }

                        ApplyTextureToRawImage(DownloadHandlerTexture.GetContent(req2));
                        yield break;
                    }
                }

                yield break;
            }

            ApplyTextureToRawImage(DownloadHandlerTexture.GetContent(req));
        }
    }

    private void ApplyTextureToRawImage(Texture2D tex)
    {
        if (tex == null)
        {
            Debug.LogWarning("Downloaded avatar texture is null.");
            return;
        }

        avatarImage.texture = tex;
        avatarImage.enabled = true;
    }
}
