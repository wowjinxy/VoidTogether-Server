import { Modules, Config } from '../../../server.js';
import chalk from 'chalk';

export default
    {
        Name: "time",

        Aliases: ["settime"],

        Description: "Set the time, either Float 0-1 or Time Name",

        RequiredPermissions: [
            "VoidTogether.User",
            "VoidTogether.Ambient.Time"
        ],
        
        AllowConsole: true,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            let ChatModule = Modules.Chat;
            
            // Get Scalar Float
            let Params = Modules.Utility.RemoveAllBefore(userMsg, " ").split(" ");
            let NewTimePercent = 0;
            if (isNaN(Params[Params.length - 1])) {
                switch (Params[Params.length - 1].toLowerCase()) {
                    case "night":
                    case "midnight":
                    {
                        NewTimePercent = 0;
                        break;
                    }
                    case "day":
                    case "noon":
                    {
                        NewTimePercent = 0.5;
                        break;
                    }
                    case "dawn":
                    case "morning":
                    {
                        NewTimePercent = 0.25;
                        break;
                    }
                    case "dusk":
                    case "evening":
                    {
                        NewTimePercent = 0.75;
                        break;
                    }
                    default: {
                        if (isConsole)
                            Modules.Command.Log(chalk.red("Couldn't parse Time parameter."));
                        else
                            ChatModule.SendMessage(ws, "<red>[Server]</>", `<red>Couldn't parse Time parameter.</>`);
                        return;
                    }
                }
            } else {
                NewTimePercent = Modules.Utility.Clamp(Number(Params[Params.length - 1]), 0, 1);
            }

            Modules.Time.dayTime = Modules.Time.fullDayLength * NewTimePercent;
            Modules.Time.BroadcastSyncTime()

            if (isConsole)
                Modules.Command.Log(chalk.green(`Set Time to ${Params[Params.length - 1]}`));
            else
                ChatModule.SendMessage(ws, "<green>[Server]</>", `<green>Set Time to ${Params[Params.length - 1]}</>`);
        }
    };