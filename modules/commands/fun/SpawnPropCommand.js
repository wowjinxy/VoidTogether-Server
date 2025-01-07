import { Modules, Config } from '../../../server.js';

export default
    {
        Name: "spawnprop",

        Aliases: ["prop"],

        Description: "Spawn a prop by its datatable name",

        RequiredPermissions: [
            "VoidTogether.User",
            "VoidTogether.Admin.Props"
        ],
        
        AllowConsole: false,

        AllowClient: true,

        Callback: (userId, userMsg, ws, isConsole = false) => {
            let PlayerModule = Modules.Player;
            let ChatModule = Modules.Chat;
            let ActivePlayerStructs = PlayerModule.ActivePlayerStructs;

            let SenderUserId = PlayerModule.FindUserId(userId);
            
            // Get Scalar Float
            let Params = Modules.Utility.RemoveAllBefore(userMsg, " ").split(" ");

            Modules.Prop.SpawnProp(Params[Params.length - 1], ActivePlayerStructs[SenderUserId].position, ActivePlayerStructs[SenderUserId].rotation, 
            {
                X: 1,
                Y: 1,
                Z: 1
            }, 
            {
                X: 0,
                Y: 0,
                Z: 0
            });
            ChatModule.SendMessage(ws, "<green>[Server]</>", `<green>Spawned Prop.</>`);
        }
    };