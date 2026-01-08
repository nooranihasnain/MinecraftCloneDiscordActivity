using UnityEngine;
public class DiscordBridgeReceiver : MonoBehaviour
{
    public void OnDiscordReady(string json)
    {
        Debug.Log("DiscordBridgeReceiver.OnDiscordReady: " + json);
        // Later: parse JSON and store mode/context/auth data
    }
    public void OnDiscordAuth(string json)
    {
        Debug.Log("OnDiscordAuth: " + json);
        // Later: parse json and use user data
    }

}
