import { Modules, Config } from '../../../server.js';
import chalk from 'chalk';

export default
    {
        Name: "help",

        Aliases: [],

        Description: "Displays all available commands",

        RequiredPermissions: [
            "VoidTogether.User"
        ],

        AllowConsole: true,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            let helpMsg = "<green>Here are the Supported Server Commands:</>";
            let consoleCommands = Modules.Command.Commands;
            consoleCommands.sort((a, b) => { if (a.name < b.name) { return -1; } if (a.name > b.name) { return 1; } return 0; });
            for (let i = 0; i < consoleCommands.length; i++) {
                if ((consoleCommands[i].AllowConsole && isConsole) || (!isConsole && consoleCommands[i].AllowClient && Modules.Permissions.CheckUserPermission(Modules.Player.Get(userId).machine, consoleCommands[i].requiredPermissions))) {
                    helpMsg += `\n<green>${Config.information.commandPrefix}${consoleCommands[i].name}${consoleCommands[i].description.length > 0 ? " - " : ""}${consoleCommands[i].description}</>`
                }
            }

            if (isConsole)
                Modules.Command.Log(chalk.green(helpMsg.replaceAll(`<green>${Config.information.commandPrefix}`,"").replaceAll("<green>","").replaceAll("</>","")));
            else
                Modules.Chat.SendMessage(ws, "<green>[Server]</>", helpMsg);
        }
    };