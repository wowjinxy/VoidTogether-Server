import { ServerModule } from '../moduleHandler.js';
import { Modules, Config, RestartServer } from '../../server.js';
import chalk from 'chalk';

export default class UptimeModule extends ServerModule {
    startTime = null;
    restartWarning = false;
    restarting = false;

    async LoadModule() {
        this.startTime = Date.now();
        this.restartWarning = false;
        this.restarting = false;
    }

    async UnloadModule() {

    }

    HandleTickUptime() {
        if (this.restarting)
            return;

        if (Date.now() - this.startTime > Config.information.autoRestartTimer * 60000) {
            // RESTART SERVER
            this.restarting = true;
            this.Log(chalk.yellowBright("SERVER IS RESTARTING AUTOMATICALLY"));
            Modules.Discord.SendWebsocket(0xF59B42, `Uptime Module`, `Server is Now Restarting Automatically!`);
            Modules.Chat.BroadcastMessage("<orange>[Server]</>", `<orange>Server restarting...</>`);
            setTimeout(RestartServer,200);
        }

        // Warning
        if ((Date.now() - this.startTime > (Config.information.autoRestartTimer * 60000) - 60000) && !this.restartWarning) {
            this.restartWarning = true;
            this.Log(chalk.yellowBright("SERVER RESTARTING IN ONE MINUTE AUTOMATICALLY"));
            Modules.Discord.SendWebsocket(0xF59B42, `Uptime Module`, `Server is Restarting Automatically in 1 Minute!`);
            Modules.Chat.BroadcastMessage("<orange>[Server]</>", `<orange>Server will restart in 1 minute...</>`);
        }
    }
}