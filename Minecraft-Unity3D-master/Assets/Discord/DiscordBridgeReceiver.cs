using UnityEngine;
public class DiscordBridgeReceiver : MonoBehaviour
{
    public void OnDiscordAuth(string json)
    {
        Debug.Log("OnDiscordAuth raw: " + json);

        var payload = JsonUtility.FromJson<DiscordAuthPayload>(json);
        if (payload?.auth?.user != null)
        {
            DiscordSessionManager.Instance.SetUser(payload.auth.user);
        }
    }
}
