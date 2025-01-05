import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import fs from 'fs';

export default class BanModule extends ServerModule {
    async LoadModule () {

    }

    async UnloadModule () {

    }

    GetBanList = (filePath = "./banList.json") => {
        if (fs.existsSync(filePath)) {
            let fileOut = JSON.parse(fs.readFileSync(filePath).toString());
            return fileOut.bans;
        }
        return [];
    }
    
    WriteBanList = (newBanList, filePath = "./banList.json") => {
        fs.writeFileSync(filePath, JSON.stringify({
            bans: newBanList ? newBanList : []
        }));
    }

    BanMachineId = (machineId, lastUsername, reason) => {
        let banList = this.GetBanList();
        for (let i=0;i<banList.length;i++) {
            if (banList[i].machine == machineId) {
                return; // Can't ban the same machine twice
            }
        }
        banList.push({
            machine: machineId,
            lastUsername: lastUsername,
            reason: reason
        });
        WriteBanList(banList);
    }

    UnbanMachineId = (machineId) => {
        let banList = this.GetBanList();
        let newBanList = [];
        for (let i=0;i<banList.length;i++) {
            if (banList[i].machine != machineId) {
                newBanList.push(banList[i]);
            }
        }
        WriteBanList(newBanList);
    }

    CheckMachineBanned = (machineId) => {
        let banList = this.GetBanList();
        if (banList == []) 
            return false;
        for (let i=0;i<banList.length;i++) {
            if (banList[i].machine == machineId) {
                return true;
            }
        }
        return false;
    }

    GetBanReason = (machineId) => {
        let banList = this.GetBanList();
        if (banList == []) 
            return "";
        for (let i=0;i<banList.length;i++) {
            if (banList[i].machine == machineId) {
                return banList[i].reason;
            }
        }
        return "";
    }
}