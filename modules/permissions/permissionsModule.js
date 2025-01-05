import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import fs from 'fs';

export default class PermissionsModule extends ServerModule {
    async LoadModule() {
        if (!this.GetPermissionsList()) {
            this.Log("Creating Default Permissions JSON");
            this.WritePermissionsList({
                default: [
                    "VoidTogether.User"
                ]
            });
        }
    }

    async UnloadModule() {

    }

    GetPermissionsList = (filePath = "./permissions.json") => {
        if (fs.existsSync(filePath)) {
            let fileOut = JSON.parse(fs.readFileSync(filePath).toString());
            return fileOut.users;
        }
        return null;
    }

    WritePermissionsList = (newPermissionList, filePath = "./permissions.json") => {
        fs.writeFileSync(filePath, JSON.stringify({
            users: newPermissionList ? newPermissionList : {}
        }, null, 4));
    }

    CheckUserPermission = (machineId, permission) => {
        if(typeof(permission) != "string") {
            let matchingPermissions = 0;
            for (let i=0;i<permission.length;i++) {
                if (this.CheckUserPermission(machineId, permission[i])) {
                    matchingPermissions++;
                }
            }
            return matchingPermissions >= permission.length;
        } else {
            let permsList = this.GetPermissionsList();
            if (permsList == {}) 
                return false;
    
            if (permsList[machineId] == null) {
                machineId = "default";
                if (permsList[machineId] == null)
                    return false;
            }
    
            let userPermList = permsList[machineId];
    
            for (let i=0;i<userPermList.length;i++) {
                if (this.CheckPermSatisfied(userPermList[i], permission))
                    return true;
            }
        }

        return false;
    }

    CheckPermSatisfied(checkString, permission) {
        // Handle Literal Equals
        if (checkString.toLowerCase() == permission.toLowerCase())
            return true;

        // Handle Wildcards
        let checkChunks = checkString.split("."); // [VoidTogether.admin.*] -> ["VoidTogether", "admin", "*"]
        let permChunks = permission.split("."); // [VoidTogether.admin.ban] -> ["VoidTogether", "admin", "ban"]
        
        let checkLength = permChunks.length < checkChunks.length ? permChunks.length : checkChunks.length; // Just in case the comparison
        for (let i=0;i<checkLength;i++) {
            if (checkChunks[i] == "*") {
                return true;
            } else {
                if (checkChunks[i].toLowerCase() != permChunks[i].toLowerCase()) {
                    return false;
                }
            }
        }
        return false;
    }
}