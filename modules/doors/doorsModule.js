import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import chalk from 'chalk';

export default class DoorsModule extends ServerModule {
    ActiveDoors = [];

    async LoadModule () {

    }

    async UnloadModule () {

    }

    FindIndex(SearchIndex) {
        for(let i=0;i<this.ActiveDoors;i++) {
            if (this.ActiveDoors[i].index == SearchIndex)
                return i;
        }
        return -1;
    }

    Get(SearchIndex) {
        let res = this.FindIndex(SearchIndex);
        if (res == -1) {
            return null;
        }
        return this.ActiveDoors[res];
    }

    HandleDoorPacket(data) {
        // Verify User based on ID
        let UserIndex = Modules.Player.FindUserId(data.userId);
        if (UserIndex == -1) {
            return; // Reject attempts without UserId
        }
        if (data.userSecret != Modules.Player.Get(data.userId).userSecret) {
            return; // Reject attempts with an incorrect Secret Token
        }

        for (let i=0;i<data.doors.length;i++) {
            console.log(data.doors[i]);
            let searchInd = this.FindIndex(data.doors[i].index);
            if (searchInd == -1) {
                this.ActiveDoors.push(new Door(data.doors[i].index, data.doors[i].open));
            } else {
                this.ActiveDoors[searchInd].open = data.doors[i].open;
                this.ActiveDoors[searchInd].needUpdate = true;
            }
        }
    }

    GetActiveDoorData(SendAll = false) {
        let doorDataString = "#doorData&";
        let success = 0;
        for (let i = 0; i < this.ActiveDoors.length; i++) {
            let CurrentDoor = this.ActiveDoors[i];

            if (SendAll || CurrentDoor.needUpdate) {
                if (success != 0)
                    doorDataString += "&";
                success++;

                this.ActiveDoors[i].needUpdate = false;
                // Format: -> propData & netId % propName % xpos % ypos % zpos % xrot % yrot % zrot % xscale % yscale % zscale % xvel % yvel % zvel % extradata & <- Separator
                // NOTE: ALL PACKET CHUNKS TERMINATE WITH & SYMBOL
                doorDataString += `${CurrentDoor.index}%${CurrentDoor.isOpen}`;
            }
        }

        if (success == 0) {
            return "";
        }

        return doorDataString;
    }

    BroadcastSyncAllDoors() {
        let PlayerModule = Modules.Player;
        let ActiveDoorDataStr = this.GetActiveDoorData();

        if (ActiveDoorDataStr != "") {
            for (let i = 0; i < PlayerModule.ActivePlayerStructs.length; i++) {
                PlayerModule.ActivePlayerStructs[i].socket.send(JSON.stringify({
                    requestType: "update",
                    data: ActiveDoorDataStr
                }));
            }
        }
    }
}

export class Door {
    constructor(ind, op) {
        this.index = ind;
        this.isOpen = op;
        this.needUpdate = true;
    }

    index = -1;
    isOpen = false;
    needUpdate = false;
}