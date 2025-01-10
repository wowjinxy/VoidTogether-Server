import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import { WebSocket } from 'ws';
import chalk from 'chalk';

export default class PlayerModule extends ServerModule {
    ActivePlayerStructs = [];

    async LoadModule() {
        this.ActivePlayerStructs = [];
    }

    async UnloadModule() {
        this.ActivePlayerStructs = [];
    }

    MakeUserId = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }

        // Make Sure No Other UserId Matches This
        for (let i = 0; i < this.ActivePlayerStructs.length; i++) {
            if (this.ActivePlayerStructs[i].userId == result) {
                return MakeUserId(length);
            }
        }

        return result;
    }

    FindUserId = (UserId) => {
        for (let i = 0; i < this.ActivePlayerStructs.length; i++) {
            if (this.ActivePlayerStructs[i].userId == UserId) {
                return i;
            }
        }
        return -1;
    }

    FindByUsername = (UserName) => {
        for (let i = 0; i < this.ActivePlayerStructs.length; i++) {
            if (this.ActivePlayerStructs[i].username.toLowerCase().trim() == UserName.toLowerCase().trim()) {
                return i;
            }
        }
        return -1;
    }

    GetActivePlayerData = (CurrentUserId) => { // Fetch a Readable Pipeline of All Active Players
        let plrDataOut = [];
        for (let i = 0; i < this.ActivePlayerStructs.length; i++) {
            if (CurrentUserId != this.ActivePlayerStructs[i].userId) {
                plrDataOut.push({
                    UserId: this.ActivePlayerStructs[i].userId,
                    Username: this.ActivePlayerStructs[i].username,
                    Position: this.ActivePlayerStructs[i].position,
                    Rotation: this.ActivePlayerStructs[i].rotation,
                    Crouching: this.ActivePlayerStructs[i].crouching,
                    Scale: this.ActivePlayerStructs[i].scale,
                    Model: this.ActivePlayerStructs[i].model,
                    Flashlight: this.ActivePlayerStructs[i].flashlight
                });
            }
        }
        return plrDataOut;
    }

    Get(UserId) {
        return this.ActivePlayerStructs[this.FindUserId(UserId)];
    }

    AddNewPlayer(Username, MachineId, Socket) {
        const NewUser = new PlayerObject(Username, MachineId, "figura", Socket);

        this.ActivePlayerStructs.push(NewUser); // Push to Array
        this.Log(chalk.blueBright(`Connected ${NewUser.username} (${NewUser.userId} | ${NewUser.machine}) <${this.ActivePlayerStructs.length} Active Players>`));

        Modules.Discord.SendWebsocket(0x23EB9A, `Player Joined (${this.ActivePlayerStructs.length}/${Config.information.maxPlayers})`, `${NewUser.username} - ${NewUser.userId}`, `**Machine Id:**\n${NewUser.machine}\n\n**Permissions Granted:**\n${Modules.Permissions.GetUserPermissions(MachineId).join("\n")}`);

        return NewUser;
    }

    UpdatePlayerData(data) {
        // First, accept the new Position and Rotation Data from the client.
        let UserIndex = this.FindUserId(data.userId);
        if (UserIndex == -1) {
            return; // Reject attempts without UserId
        }
        if (data.userSecret != this.ActivePlayerStructs[UserIndex].userSecret) {
            return; // Reject attempts with an incorrect Secret Token
        }
        // Copy Data from Request to Cache
        this.ActivePlayerStructs[UserIndex].position = data.position;
        this.ActivePlayerStructs[UserIndex].rotation = data.rotation;
        this.ActivePlayerStructs[UserIndex].crouching = data.crouching;
        this.ActivePlayerStructs[UserIndex].scale = data.scale;
        if (data.model)
            this.ActivePlayerStructs[UserIndex].model = data.model;
        if (data.flashlight)
            this.ActivePlayerStructs[UserIndex].flashlight = data.flashlight;
        this.ActivePlayerStructs[UserIndex].lastPing = new Date().getTime(); // Make this the current Last Ping Timestamp

        //console.log(this.ActivePlayerStructs[UserIndex]);
    }

    BroadcastSyncAllPlayers() {
        for (let i = 0; i < this.ActivePlayerStructs.length; i++) {
            this.ActivePlayerStructs[i].socket.send(JSON.stringify({
                requestType: "update",
                data: this.GetActivePlayerData(this.ActivePlayerStructs[i].userId)
            }));
        }
    }

    DisconnectOldSockets() {
        let currentUnix = new Date().getTime();
        let filteredStructs = [];
        let currentPlayerCount = this.ActivePlayerStructs.length;
        for (let i = 0; i < this.ActivePlayerStructs.length; i++) {
            if (this.ActivePlayerStructs[i].lastPing + Config.information.socketTimeout > currentUnix && this.ActivePlayerStructs[i].socket.readyState != WebSocket.CLOSED) {
                filteredStructs.push(this.ActivePlayerStructs[i]);
            }
            else {
                this.Log(chalk.redBright(`Dropped ${this.ActivePlayerStructs[i].username} (${this.ActivePlayerStructs[i].userId} | ${this.ActivePlayerStructs[i].machine}) - Max Inactivity Lifetime Reached`));
                this.ActivePlayerStructs[i].socket.close(); // Close the socket to prevent further attempts to communicate

                // Notify All Players
                currentPlayerCount--;
                Modules.Chat.BroadcastMessage("<yellow>[Left]</>", `<yellow>${this.ActivePlayerStructs[i].username} (${currentPlayerCount} Online)</>`);

                Modules.Discord.SendWebsocket(0xEB4423, `Player Left (${this.ActivePlayerStructs.length - 1}/${Config.information.maxPlayers})`, `${this.ActivePlayerStructs[i].username} - ${this.ActivePlayerStructs[i].userId}`);
            }
        }
        if (this.ActivePlayerStructs.length != filteredStructs.length) {
            this.Log(chalk.yellowBright(`Current Established Player Count <${filteredStructs.length} Active Players>`));
        }
        this.ActivePlayerStructs = filteredStructs;
    }

    // Functional Methods
    TeleportPlayer(userId, posX = null, posY = null, posZ = null) {
        let plrIndex = this.FindUserId(userId);
        if (plrIndex == -1) return;

        if (isNaN(posX)) posX = this.ActivePlayerStructs[plrIndex].position.X;
        if (isNaN(posY)) posY = this.ActivePlayerStructs[plrIndex].position.Y;
        if (isNaN(posZ)) posZ = this.ActivePlayerStructs[plrIndex].position.Z;

        // Set position on Server
        this.ActivePlayerStructs[plrIndex].position = {
            X: posX,
            Y: posY,
            Z: posZ
        };

        // Send update to client
        this.ActivePlayerStructs[plrIndex].socket.send(JSON.stringify({
            requestType: "teleportPlayer",
            X: posX,
            Y: posY,
            Z: posZ,
        }));
    }

    SetPlayerScale(userId, newScale = 1) {
        let plrIndex = this.FindUserId(userId);
        if (plrIndex == -1) return;

        // Set Scale on Server
        this.ActivePlayerStructs[plrIndex].scale = newScale;

        // Send update to client
        this.ActivePlayerStructs[plrIndex].socket.send(JSON.stringify({
            requestType: "resizePlayer",
            X: newScale,
            Y: newScale,
            Z: newScale,
        }))
    }
}

export class PlayerObject {
    constructor(Username, MachineId, Model, Connection) {
        this.username = Modules.Utility.SimplifyName(Modules.Utility.CensorSwears(Username));
        this.machine = MachineId;
        this.userId = Modules.Player.MakeUserId(8),
            this.userSecret = Modules.Player.MakeUserId(16),
            this.lastPing = new Date().getTime()
        this.model = Model;
        this.socket = Connection;
    }

    username = null;
    userId = null;
    userSecret = null;
    position = {
        X: 0,
        Y: 0,
        Z: 0
    };
    rotation = {
        X: 0,
        Y: 0,
        Z: 0
    };
    crouching = false;
    flashlight = false;
    lastPing = new Date().getTime();
    socket = null;
    model = 'figura';
    scale = 1;
    machine = null;

    // Functions
    Teleport(posX, posY, posZ) {
        Modules.Player.TeleportPlayer(this.userId, posX, posY, posZ);
    }

    SetScale(newScale) {
        Modules.Player.SetPlayerScale(this.userId, newScale);
    }
}