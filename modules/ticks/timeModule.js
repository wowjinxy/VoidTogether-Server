import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';

export default class TimeModule extends ServerModule {
    daySyncLoop = null;
    dayTime = 0;
    fullDayLength = 0;

    timeScale = 1;

    async LoadModule() {
        this.fullDayLength = Config.gameplay.dayLength * 60 * 1000; // Set the measurement for day completion here

        this.dayTime = this.fullDayLength * Math.max(Math.min(Config.gameplay.dayStartingPercent, 1), 0);

        this.daySyncLoop = setInterval(this.BroadcastSyncTime, 2000 / Config.information.tickRate); // Sync Every Other Tick
    }

    async UnloadModule() {
        clearInterval(this.daySyncLoop);
        this.daySyncLoop = null;
    }

    UpdateCycle(deltaTime) {
        this.dayTime = this.dayTime + (deltaTime * this.timeScale);
        if (this.dayTime >= this.fullDayLength) {
            // New Day
            this.dayTime -= this.fullDayLength;
        }
    }

    BroadcastSyncTime() {
        let PlayerModule = Modules.Player
        for (let i = 0; i < PlayerModule.ActivePlayerStructs.length; i++) {
            PlayerModule.ActivePlayerStructs[i].socket.send(JSON.stringify({
                requestType: "ambient",
                time: Modules.Time.dayTime / Modules.Time.fullDayLength // Sets daytime based on 0-1 progression
            }));
        }
    }
}