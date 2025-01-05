import { Modules, Config } from '../../../server.js';

export default
    {
        Name: "tphere",

        Aliases: [],

        Description: "Teleports a specific player to your location",

        RequiredPermissions: [
            "VoidTogether.User",
            "VoidTogether.Admin.Teleport"
        ],

        AllowConsole: false,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            let PlayerModule = Modules.Player;
            let ChatModule = Modules.Chat;
            let ActivePlayerStructs = PlayerModule.ActivePlayerStructs;

            let SenderUserId = PlayerModule.FindUserId(userId);
            
            // Try finding Player by ID, then Username
            let SearchFor = Modules.Utility.RemoveAllBefore(userMsg, " ");
            let FoundUserIndex = PlayerModule.FindUserId(SearchFor);
            if (FoundUserIndex == -1) {
                FoundUserIndex = PlayerModule.FindByUsername(SearchFor)
            }

            if (FoundUserIndex != -1) {
                PlayerModule.TeleportPlayer(ActivePlayerStructs[FoundUserIndex].userId, ActivePlayerStructs[SenderUserId].position[0], ActivePlayerStructs[SenderUserId].position[1], ActivePlayerStructs[SenderUserId].position[2]);
                ChatModule.SendMessage(ActivePlayerStructs[FoundUserIndex].socket, "<yellow>[Server]</>", `<yellow>You were teleported by ${ActivePlayerStructs[SenderUserId].username}</>`);

                ChatModule.SendMessage(ws, "<green>[Server]</>", `<green>Teleported ${ActivePlayerStructs[FoundUserIndex].username} to you.</>`);
            } else {
                ChatModule.SendMessage(ws, "<red>[Server]</>", `<red>Couldn't find a player with this identifier.</>`);
            }
        }
    };