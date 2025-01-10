import { Modules, Config } from '../../../server.js';
import chalk from "chalk";

export default
    {
        Name: "sizeall",

        Aliases: ["scaleall"],

        Description: "Resizes all players by a scale factor 0.25 to 5",

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

            for (let i = 0; i < ActivePlayerStructs.length; i++) {
                PlayerModule.SetPlayerScale(ActivePlayerStructs[i].userId, Modules.Utility.Clamp(parseFloat(Params[Params.length - 1]), 0.25, 5));
                ChatModule.SendMessage(ActivePlayerStructs[i].socket, "<yellow>[Server]</>", `<yellow>You were resized by ${SenderUsername}</>`);
            }

            if (isConsole)
                Modules.Command.Log(chalk.green("Resized all players."));
            else
                ChatModule.SendMessage(ws, "<green>[Server]</>", `<green>Resized all players.</>`);
        }
    };