import { Modules, Config, RestartServer } from '../../../server.js';
import chalk from 'chalk';

export default
    {
        Name: "restart",

        Aliases: [],

        Description: "Restarts the server from the console",

        RequiredPermissions: [
            "VoidTogether.User",
            "VoidTogether.Admin.Server"
        ],
        
        AllowConsole: true,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            Modules.Chat.BroadcastMessage("<orange>[Server]</>", `<orange>Server Restarting in 5 Seconds...</>`);
            Modules.Command.Log(chalk.yellowBright("Restarting Server in 5 Seconds..."));
            Modules.Discord.SendWebsocket(0xF59B42, `Uptime Module`, `Server is Restarting Manually!`);
            setTimeout(RestartServer,5000)
        }
    };