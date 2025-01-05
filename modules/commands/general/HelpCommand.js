import { Modules, Config } from '../../../server.js';

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
            for (let i = 0; i < consoleCommands.length; i++) {
                helpMsg += `\n<green>${Config.information.commandPrefix}${consoleCommands[i].name}${consoleCommands[i].description.length > 0 ? " - " : ""}${consoleCommands[i].description}</>`
            }

            Modules.Chat.SendMessage(ws, "<green>[Server]</>", helpMsg);
        }
    };