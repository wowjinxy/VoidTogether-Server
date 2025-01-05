import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js'
import { WebSocketServer } from 'ws';
import chalk from 'chalk';

export default class SocketModule extends ServerModule {
    WebSocketServer = null

    async LoadModule() {

    }

    async UnloadModule() {

    }

    CreateWebsocket() {
        this.WebSocketServer = new WebSocketServer({
            port: Config.information.port, 
            host: Config.information.host
        });

        this.WebSocketServer.on('connection', function connection(ws) {
            ws.on('error', console.error);

            // Received Message from a Player
            ws.on('message', function message(data) {
                if (!data)
                    return;

                data = JSON.parse(data);

                if (data.requestType == "info") { // SEND SERVER INFO
                    Modules.Info.SendServerInfo(ws);
                } 
                else if (data.requestType == "ping") { // PING SERVER CHECK MS
                    ws.send("{}"); // Send blank to get fastest ping
                }
                else if (data.requestType == "join") { // HANDLE USER JOIN
                    Modules.Auth.AuthenticateJoinRequest(data, ws);
                }
                else if (data.requestType == "update") { // HANDLE USER UPDATING POSITION
                    Modules.Player.UpdatePlayerData(data)
                }
                else if (data.requestType == "chat") { // HANDLE CHAT MESSAGE
                    Modules.Chat.HandleChatMessage(data)
                }
                else if (data.requestType == "propUpdate") { // HANDLE PROPS
                    Modules.Prop.UpdatePropData(data)
                } 
                else if (data.requestType == "propDelete") { // HANDLE DELETING PROPS
                    Modules.Prop.HandleNetworkDestroy(data)
                }
                else if (data.requestType == "doorUpdate") { // HANDLE DOORS
                    Modules.Doors.HandleDoorPacket(data)
                } 
            });
        });

        this.Log(chalk.cyanBright(`Started Hosting Server on Port ${Config.information.port}`));
    }
}