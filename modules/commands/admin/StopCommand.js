import { Modules, Config, RestartServer } from '../../../server.js';
import chalk from 'chalk';

export default
    {
        Name: "stop",

        Aliases: ["exit"],

        Description: "Stops the server from the console",

        RequiredPermissions: [
            "VoidTogether.User",
            "VoidTogether.Admin.Server"
        ],
        
        AllowConsole: true,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            Modules.Chat.BroadcastMessage("<red>[Server]</>", `<red>Server Stopping in 5 Seconds...</>`);
            Modules.Command.Log(chalk.redBright("Stopping Server in 5 Seconds..."));
            Modules.Discord.SendWebsocket(0xF59B42, `Uptime Module`, `Server is Stopping Manually!`);
            setTimeout(process.exit,5000);
        }
    };