import { Modules, Config } from '../../../server.js';
import chalk from 'chalk';

export default
    {
        Name: "kick",

        Aliases: [],

        Description: "Kicks a specific player from the game",

        RequiredPermissions: [
            "VoidTogether.User",
            "VoidTogether.Admin.Kick"
        ],
        
        AllowConsole: true,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            const PlayerModule = Modules.Player;
            const ChatModule = Modules.Chat;
            let ActivePlayerStructs = PlayerModule.ActivePlayerStructs;
            
            // Get Scalar Float
            let Params = Modules.Utility.RemoveAllBefore(userMsg, " ").split(" ");

            // Try finding Player by ID, then Username
            let SearchFor = Params.shift();
            let FoundUserIndex = PlayerModule.FindByUsername(SearchFor);
            if (FoundUserIndex == -1) {
                FoundUserIndex = PlayerModule.FindUserId(SearchFor)
            }

            let Reason = Params.join(" ");

            if (FoundUserIndex != -1) {
                if (Modules.Permissions.CheckUserPermission(ActivePlayerStructs[FoundUserIndex].machine, "VoidTogether.Admin.Kick") && !isConsole) {
                    ChatModule.SendMessage(ws, "<red>[Server]</>", `<red>You do not have the permissions to kick this player.</>`);
                    return;
                }

                ActivePlayerStructs[FoundUserIndex].socket.close();
                Modules.Discord.SendWebsocket(0xB18F49, `Player Kicked by ${(isConsole ? "[SERVER]" : userId)}`, `${ActivePlayerStructs[FoundUserIndex].username} - ${ActivePlayerStructs[FoundUserIndex].userId}`, `**Reason:** ${Reason}`);
                
                Modules.Command.Log(chalk.green(`Kicked ${ActivePlayerStructs[FoundUserIndex].username} for Reason: ${Reason}`));
                if (!isConsole)
                    ChatModule.SendMessage(ws, "<green>[Server]</>", `<green>Kicked ${ActivePlayerStructs[FoundUserIndex].username} for Reason: ${Reason}</>`);
            } else {
                if (isConsole)
                    Modules.Command.Log(chalk.red("Couldn't find a player with this identifier."));
                else
                    ChatModule.SendMessage(ws, "<red>[Server]</>", `<red>Couldn't find a player with this identifier.</>`);
            }
        }
    };