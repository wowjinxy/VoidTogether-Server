import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';

export default class TickModule extends ServerModule {
    gameUpdateLoop = null;
    lastUpdate = null;

    async LoadModule() {
        this.lastUpdate = Date.now();
        this.gameUpdateLoop = setInterval(this.TickUpdate, 1000 / Config.information.tickRate);
    }

    async UnloadModule() {
        clearInterval(this.gameUpdateLoop);
        this.gameUpdateLoop = null;
    }

    TickUpdate() {
        // First Calculate The Tick Time
        let deltaTime = Date.now() - this.lastUpdate;
        if (!deltaTime) deltaTime = 0;

        // Afterwards, Update the Last Tick Time
        this.lastUpdate = Date.now();

        // Update the Game's current Time of Day, Weather, Etc.
        Modules.Time.UpdateCycle(deltaTime);

        // Handle Props Here
        Modules.Prop.BroadcastSyncAllProps();

        // Handle Doors Here
        Modules.Doors.BroadcastSyncAllDoors();

        // Disconnect Missing Players
        Modules.Player.DisconnectOldSockets();

        // Finally, Sync All Player Positions
        Modules.Player.BroadcastSyncAllPlayers();
    }
}