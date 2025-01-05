import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';

export default class AuthModule extends ServerModule {
    async LoadModule() {

    }

    async UnloadModule() {

    }

    AuthenticateJoinRequest(data, ws) {
        // Check the Password
        if (Config.information.password && Config.information.password != "") {
            if (Config.information.password != data.password) {
                this.Log("No username");
                ws.close();
                return;
            }
        }

        // Require a username.
        if (!data.username) {
            this.Log("No username");
            ws.close();
            return;
        }

        // Prevent Out of Date Clients as well
        if (!data.version || data.version != Config.information.clientVersion) {
            this.Log("No version");
            ws.close();
            return;
        }

        // Machine Id is REQUIRED
        if (!data.machine || data.machine.length != 64) {
            this.Log("Bad machine");
            ws.close();
            return;
        }

        // Banned Players Cannot Connect
        if (Modules.Ban.CheckMachineBanned(data.machine)) {
            this.Log(chalk.redBright(`User with Banned Machine ID ${data.machine} attempted connection. Ban Reason: ${Modules.Ban.GetBanReason(data.machine)}`));
            ws.close();
            return;
        }

        let NewUser = Modules.Player.AddNewPlayer(data.username, data.machine, ws);

        ws.send(JSON.stringify({
            requestType: "auth",
            userId: NewUser.userId,
            userSecret: NewUser.userSecret,
            tickRate: Config.information.tickRate
        }));

        // Fill in Player with Current Up to Date Position Data
        ws.send(JSON.stringify({
            requestType: "update",
            data: Modules.Player.GetActivePlayerData(NewUser.userId)
        }));
        ws.send(JSON.stringify({
            requestType: "propUpdate",
            data: Modules.Prop.GetActivePropData(true)
        }));

        // Notify All Players
        Modules.Chat.BroadcastMessage("<yellow>[Joined]</>", `<yellow>${NewUser.username} (${Modules.Player.ActivePlayerStructs.length} Online)</>`);

        // Notify Admins they exist
        if (NewUser.isAdmin) {
            Modules.Chat.SendMessage(ws, "<cyan>[Server]</>", "<cyan>Administrative Privileges Granted.</>");
        }
    }
}