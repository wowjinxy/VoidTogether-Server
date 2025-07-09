using System.Collections.Generic;

public class ServerConfig
{
    public Properties properties { get; set; }
}

public class Properties
{
    public Information information { get; set; }
    public Gameplay gameplay { get; set; }
    public Discord discord { get; set; }
}

public class Information
{
    public string name { get; set; }
    public string motd { get; set; }
    public string clientVersion { get; set; }
    public string host { get; set; }
    public int port { get; set; }
    public int maxPlayers { get; set; }
    public string defaultMap { get; set; }
    public string password { get; set; }
    public string commandPrefix { get; set; }
    public int tickRate { get; set; }
    public int socketTimeout { get; set; }
    public int autoRestartTimer { get; set; }
}

public class Gameplay
{
    public int dayLength { get; set; }
    public double dayStartingPercent { get; set; }
}

public class Discord
{
    public string clientId { get; set; }
    public string botToken { get; set; }
    public string webhook { get; set; }
}
