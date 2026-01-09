[System.Serializable]
public class DiscordAuthPayload
{
    public string mode;
    public DiscordAuth auth;
}

[System.Serializable]
public class DiscordAuth
{
    public DiscordUser user;
}

[System.Serializable]
public class DiscordUser
{
    public string id;
    public string username;
    public string avatar;
}
