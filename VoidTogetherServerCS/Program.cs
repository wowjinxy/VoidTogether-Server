using System;
using System.IO;
using System.Windows.Forms;
using Fleck;
using System.Text.Json;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;
using System.Collections.Generic;
using System.Threading;

class Player
{
    public string UserId { get; set; }
    public string UserSecret { get; set; }
    public string Username { get; set; }
    public string Machine { get; set; }
    public IWebSocketConnection Socket { get; set; }
}

class Program
{
    internal static ServerConfig Config;
    internal static List<Player> Players = new();
    internal static int NextUserId = 0;
    static WebSocketServer? _server;
    static Action? _log;
    static Action? _updatePlayers;

    [STAThread]
    static void Main(string[] args)
    {
        Config = LoadConfig();
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new MainForm());
    }

    static ServerConfig LoadConfig()
    {
        var deserializer = new DeserializerBuilder()
            .WithNamingConvention(CamelCaseNamingConvention.Instance)
            .Build();
        var yaml = File.ReadAllText("../serverconf.yml");
        return deserializer.Deserialize<ServerConfig>(yaml);
    }

    internal static void StartServer(Action<string> log, Action updatePlayers)
    {
        _log = log;
        _updatePlayers = updatePlayers;
        FleckLog.Level = LogLevel.Info;
        string host = string.IsNullOrEmpty(Config.properties.information.host) ? "0.0.0.0" : Config.properties.information.host;
        _server = new WebSocketServer($"ws://{host}:{Config.properties.information.port}");
        _server.Start(socket => HandleSocket(socket));
        log($"Server running on {host}:{Config.properties.information.port}");
    }

    internal static void StopServer()
    {
        if (_server != null)
        {
            _server.Dispose();
            _server = null;
        }
        lock (Players)
        {
            foreach (var p in Players)
                p.Socket.Close();
            Players.Clear();
        }
    }

    static void HandleSocket(IWebSocketConnection socket)
    {
        Player player = null;
        socket.OnMessage = message => OnMessage(socket, ref player, message);
        socket.OnClose = () =>
        {
            if (player != null)
            {
                lock (Players) Players.Remove(player);
                _log?.Invoke($"Player {player.Username} disconnected");
                _updatePlayers?.Invoke();
            }
        };
    }

    static void OnMessage(IWebSocketConnection socket, ref Player player, string msg)
    {
        try
        {
            using var doc = JsonDocument.Parse(msg);
            var root = doc.RootElement;
            if (!root.TryGetProperty("requestType", out var typeElement)) return;
            var type = typeElement.GetString();
            switch (type)
            {
                case "info":
                    var info = new
                    {
                        title = Config.properties.information.name,
                        motd = Config.properties.information.motd,
                        version = Config.properties.information.clientVersion,
                        maxOnline = Config.properties.information.maxPlayers,
                        online = Players.Count
                    };
                    socket.Send(JsonSerializer.Serialize(info));
                    socket.Close();
                    break;
                case "ping":
                    socket.Send("{}");
                    break;
                case "join":
                    if (!HandleJoin(socket, root, out player))
                        socket.Close();
                    else
                    {
                        _log?.Invoke($"Player {player.Username} connected");
                        _updatePlayers?.Invoke();
                    }
                    break;
                case "update":
                    // Example: store last ping
                    if (player != null)
                    {
                        // here you could process player position
                    }
                    break;
            }
        }
        catch (Exception ex)
        {
            _log?.Invoke(ex.ToString());
        }
    }

    static bool HandleJoin(IWebSocketConnection socket, JsonElement data, out Player player)
    {
        player = null;
        string password = data.GetProperty("password").GetString();
        string machine = data.GetProperty("machine").GetString();
        string username = data.GetProperty("username").GetString();
        string version = data.GetProperty("version").GetString();

        if (!string.IsNullOrEmpty(Config.properties.information.password) && password != Config.properties.information.password)
            return false;
        if (string.IsNullOrEmpty(machine) || machine.Length != 64)
            return false;
        if (string.IsNullOrEmpty(username))
            return false;
        if (version != Config.properties.information.clientVersion)
            return false;
        if (Players.Count >= Config.properties.information.maxPlayers)
            return false;

        var id = Interlocked.Increment(ref NextUserId);
        var secret = Guid.NewGuid().ToString("N");
        player = new Player { UserId = id.ToString(), UserSecret = secret, Username = username, Machine = machine, Socket = socket };
        lock (Players) Players.Add(player);

        var auth = new { requestType = "auth", userId = player.UserId, userSecret = player.UserSecret, tickRate = Config.properties.information.tickRate };
        socket.Send(JsonSerializer.Serialize(auth));
        return true;
    }

    internal static void ExecuteCommand(string command, Action<string> log)
    {
        var parts = command.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return;
        switch (parts[0].ToLower())
        {
            case "list":
                lock (Players)
                {
                    foreach (var p in Players)
                        log(p.Username);
                }
                break;
            case "stop":
                StopServer();
                log("Server stopped");
                break;
            default:
                log($"Unknown command: {parts[0]}");
                break;
        }
    }
}
