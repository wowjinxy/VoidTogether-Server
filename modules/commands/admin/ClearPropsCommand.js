import { Modules, Config } from '../../../server.js';
import chalk from 'chalk';

export default
    {
        Name: "clear",

        Aliases: ["clearprops"],

        Description: "Clears all props from the map",

        RequiredPermissions: [
            "VoidTogether.User",
            "VoidTogether.Admin.Props"
        ],
        
        AllowConsole: true,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            let oldActive = Modules.Prop.ActiveProps;
            for (let i=0;i<oldActive.length;i++) {
                Modules.Prop.DestroyProp(oldActive[i].networkId);
            } 
            
            if (isConsole)
                Modules.Command.Log(chalk.green(`Cleared All Props.`));
            else
                Modules.Chat.SendMessage(ws, "<green>[Server]</>", `<green>Cleared All Props.</>`);
        }
    };