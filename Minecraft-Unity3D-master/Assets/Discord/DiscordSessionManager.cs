using UnityEngine;
using UnityEngine.Events;

public class DiscordSessionManager : MonoBehaviour
{
    public static DiscordSessionManager Instance { get; private set; }
    public DiscordUser CurrentUser { get; private set; }
    public UnityEvent onUserAssigned;

    private void Awake()
    {
        if (Instance != null) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public void SetUser(DiscordUser user)
    {
        CurrentUser = user;
        onUserAssigned?.Invoke();
        Debug.Log($"Discord user set: {user.username} ({user.id})");
    }
}
