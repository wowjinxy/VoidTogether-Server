import { Modules, Config } from '../../../server.js';

export default
    {
        Name: "size",

        Aliases: ["scale"],

        Description: "Resizes a player by a scale factor 0.25 to 5",

        RequiredPermissions: [
            "VoidTogether.User",
            "VoidTogether.Admin.Size"
        ],
        
        AllowConsole: true,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            let PlayerModule = Modules.Player;
            let ChatModule = Modules.Chat;
            let ActivePlayerStructs = PlayerModule.ActivePlayerStructs;

            let SenderUserId = PlayerModule.FindUserId(userId);
            let SenderUsername = ActivePlayerStructs[SenderUserId].username;
            
            // Get Scalar Float
            let Params = Modules.Utility.RemoveAllBefore(userMsg, " ").split(" ");
            if (isNaN(Params[Params.length - 1])) {
                ChatModule.SendMessage(ws, "<red>[Server]</>", `<red>Couldn't parse scalar parameter.</>`);
                return;
            }

            // Try finding Player by ID, then Username
            let SearchFor = Params[0]
            let FoundUserIndex = PlayerModule.FindUserId(SearchFor);
            if (FoundUserIndex == -1) {
                FoundUserIndex = PlayerModule.FindByUsername(SearchFor)
            }

            if (FoundUserIndex != -1) {
                PlayerModule.SetPlayerScale(ActivePlayerStructs[FoundUserIndex].userId, Modules.Utility.Clamp(parseFloat(Params[Params.length - 1]), 0.25, 5));
                ChatModule.SendMessage(ActivePlayerStructs[FoundUserIndex].socket, "<yellow>[Server]</>", `<yellow>You were resized by ${SenderUsername}</>`);

                ChatModule.SendMessage(ws, "<green>[Server]</>", `<green>Resized ${ActivePlayerStructs[FoundUserIndex].username}.</>`);
            } else {
                ChatModule.SendMessage(ws, "<red>[Server]</>", `<red>Couldn't find a player with this identifier.</>`);
            }
        }
    };