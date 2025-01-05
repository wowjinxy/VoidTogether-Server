import { Modules, Config } from '../../../server.js';

export default
    {
        Name: "tpall",

        Aliases: ["tpahere"],

        Description: "Teleports all players to your location",

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
            let SenderUsername = ActivePlayerStructs[SenderUserId].username;
            
            for (let i = 0; i < ActivePlayerStructs.length; i++) {
                if (ActivePlayerStructs[i].userId != userId) {
                    PlayerModule.TeleportPlayer(ActivePlayerStructs[i].userId,ActivePlayerStructs[SenderUserId].position[0],ActivePlayerStructs[SenderUserId].position[1],ActivePlayerStructs[SenderUserId].position[2]);
                    ChatModule.SendMessage(ActivePlayerStructs[i].socket, "<yellow>[Server]</>", `<yellow>You were teleported by ${SenderUsername}</>`);
                }
            }
            ChatModule.SendMessage(ws, "<green>[Server]</>", `<green>Teleported all players to you.</>`);
        }
    };