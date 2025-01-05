import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import chalk from 'chalk';
import fs from 'fs';

export default class InfoModule extends ServerModule {
    iconBase64 = null;

    async LoadModule () {
        this.iconBase64 = Buffer.from(Array.from(fs.readFileSync('servericon.png'))).toString('base64');
    }

    async UnloadModule () {
        this.iconBase64 = null;
    }

    async SendServerInfo (ws) {
        ws.send(JSON.stringify({
            title: Config.information.name,
            motd: Config.information.motd,
            version: Config.information.clientVersion,
            icon: this.iconBase64,
            defaultMap: Config.information.defaultMap,
            online: Modules.Player.ActivePlayerStructs.length,
            maxOnline: Config.information.maxPlayers
        }));
        ws.close();
    }
}