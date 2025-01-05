import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';

export default class PropModule extends ServerModule {
    ActiveProps = [];

    async LoadModule() {
        this.ActiveProps = [];
    }

    async UnloadModule() {
        this.ActiveProps = [];
    }

    MakeNetworkId = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }

        // Make Sure No Other UserId Matches This
        for (let i = 0; i < this.ActiveProps.length; i++) {
            if (this.ActiveProps[i].networkId == result) {
                return MakeNetworkId(length);
            }
        }

        return result;
    }

    SpawnProp(PropName, Position, Rotation, Scale, Velocity, PropData) {
        let NewProp = new NetworkedProp(PropName);

        NewProp.position = Position;
        NewProp.rotation = Rotation;
        NewProp.scale = Scale;
        NewProp.velocity = Velocity;

        if (!PropData || PropData == undefined) {
            if (PropName == "cq_0") {
                NewProp.data = {
                    battery: 100,
                    health: 100,
                    light: false,
                    brake: false
                };
            } else {
                NewProp.data = {};
            }
        } else {
            NewProp.data = PropData;
        }

        this.ActiveProps.push(NewProp);

        this.Log(`Spawned ${NewProp.networkId} ${PropName} ${PropData}`);

        return NewProp;
    }

    GetActivePropData(SendAll = false) {
        let propDataList = [];
        for (let i = 0; i < this.ActiveProps.length; i++) {
            let CurrentProp = this.ActiveProps[i];

            if (SendAll || CurrentProp.needUpdate) {
                if (!SendAll)
                    this.ActiveProps[i].needUpdate = false;

                propDataList.push(CurrentProp);
                // Format: -> propData & netId % propName % xpos % ypos % zpos % xrot % yrot % zrot % xscale % yscale % zscale % xvel % yvel % zvel % extradata & <- Separator
                // NOTE: ALL PACKET CHUNKS TERMINATE WITH & SYMBOL
                //propDataString += `${CurrentProp.networkId}%${CurrentProp.name}%${CurrentProp.position[0]}%${CurrentProp.position[1]}%${CurrentProp.position[2]}%${CurrentProp.rotation[0]}%${CurrentProp.rotation[1]}%${CurrentProp.rotation[2]}%${CurrentProp.scale[0]}%${CurrentProp.scale[1]}%${CurrentProp.scale[2]}%${CurrentProp.velocity[0]}%${CurrentProp.velocity[1]}%${CurrentProp.velocity[2]}%${CurrentProp.data}`;
            }
        }
        return propDataList;
    }

    FindIndex(NetworkId) {
        for (let i = 0; i < this.ActiveProps.length; i++) {
            if (this.ActiveProps[i].networkId == NetworkId) {
                return i;
            }
        }
        return -1;
    }

    Get(NetworkId) {
        for (let i = 0; i < this.ActiveProps.length; i++) {
            if (this.ActiveProps[i].networkId == NetworkId) {
                return this.ActiveProps[i];
            }
        }
        return null;
    }

    UpdatePropData(data) {
        // First, verify this is a real player
        let UserIndex = Modules.Player.FindUserId(data.userId);
        if (UserIndex == -1) {
            return; // Reject attempts without UserId
        }
        if (data.userSecret != Modules.Player.ActivePlayerStructs[UserIndex].userSecret) {
            return; // Reject attempts with an incorrect Secret Token
        }

        for (let i = 0; i < data.props.length; i++) {
            let PropIndex = this.FindIndex(data.props[i].networkId);
            if (PropIndex == -1) {
                if (data.props[i].networkId == "*")
                    this.SpawnProp(data.props[i].name, data.props[i].position, data.props[i].rotation, data.props[i].scale, data.props[i].velocity, data.props[i].data);
            } else {
                // Copy Data from Request to Cache
                this.ActiveProps[PropIndex].name = data.props[i].name;
                this.ActiveProps[PropIndex].position = data.props[i].position;
                this.ActiveProps[PropIndex].rotation = data.props[i].rotation;
                this.ActiveProps[PropIndex].scale = data.props[i].scale;
                this.ActiveProps[PropIndex].velocity = data.props[i].velocity;
                this.ActiveProps[PropIndex].lastOwner = data.props[i].userId;
                this.ActiveProps[PropIndex].isLocked = data.props[i].isLocked;

                if (!(!data.props[i].data || data.props[i].data == undefined || data.props[i].data == "")) {
                    this.ActiveProps[PropIndex].data = data.props[i].data;
                }

                this.ActiveProps[PropIndex].needUpdate = true;
            }
        }
    }

    BroadcastSyncAllProps() {
        let PlayerModule = Modules.Player
        let ActivePropDataList = this.GetActivePropData();

        if (ActivePropDataList.length) {
            for (let i = 0; i < PlayerModule.ActivePlayerStructs.length; i++) {
                PlayerModule.ActivePlayerStructs[i].socket.send(JSON.stringify({
                    requestType: "propUpdate",
                    data: ActivePropDataList
                }));
            }
        }
    }

    HandleNetworkDestroy(data) {
        // First, verify this is a real player
        let UserIndex = Modules.Player.FindUserId(data.userId);
        if (UserIndex == -1) {
            return; // Reject attempts without UserId
        }
        if (data.userSecret != Modules.Player.ActivePlayerStructs[UserIndex].userSecret) {
            return; // Reject attempts with an incorrect Secret Token
        }

        this.DestroyProp(data.networkId);
    }

    DestroyProp(NetworkId) {
        this.Log(`Destroyed ${NetworkId}`);
        let newActiveProps = [];
        for (let i = 0; i < this.ActiveProps.length; i++) {
            if (this.ActiveProps[i].networkId == NetworkId && !(!this.ActiveProps[i].networkId)) {
                for (let l = 0; l < Modules.Player.ActivePlayerStructs.length; l++) {
                    Modules.Player.ActivePlayerStructs[l].socket.send(JSON.stringify({
                        requestType: "propDelete",
                        networkId: this.ActiveProps[i].networkId
                    }));
                }
            } else {
                newActiveProps.push(this.ActiveProps[i]);
            }
        }
        this.ActiveProps = newActiveProps;
    }
}

export class NetworkedProp {
    constructor(PropName) {
        this.name = PropName;
        this.networkId = Modules.Prop.MakeNetworkId(8);
        this.needUpdate = true;
    }

    name = null;
    networkId = null;
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
    scale = {
        X: 1,
        Y: 1,
        Z: 1
    };
    velocity = {
        X: 0,
        Y: 0,
        Z: 0
    };
    isLocked = false;
    lastOwner = null;
    data = {};
    needUpdate = false;
}