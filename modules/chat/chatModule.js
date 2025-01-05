import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import chalk from 'chalk';

export default class ChatModule extends ServerModule {
    async LoadModule () {

    }

    async UnloadModule () {

    }

    SendMessage (RecipientId, SenderName, Content, SenderId = null) {
        if (typeof RecipientId == "string")  {
            Modules.Player.Get(RecipientId).socket.send(JSON.stringify({
                requestType: "chat",
                name: SenderName,
                content: Content,
                senderId: SenderId
            }))
        } else {
            RecipientId.send(JSON.stringify({
                requestType: "chat",
                name: SenderName,
                content: Content,
                senderId: SenderId
            }))
        }
    }
    
    BroadcastMessage (SenderName, Content, SenderId = null) {
        // Notify All Players
        let ActivePlayerStructs = Modules.Player.ActivePlayerStructs;
        for (let i = 0; i < ActivePlayerStructs.length; i++) {
            this.SendMessage(ActivePlayerStructs[i].socket, SenderName, Content, SenderId);
        }
    }

    AdminMessage (SenderName, Content, SenderId = null) {
        // Notify All Admins
        let ActivePlayerStructs = Modules.Player.ActivePlayerStructs;
        for (let i = 0; i < ActivePlayerStructs.length; i++) {
            if (ActivePlayerStructs[i].isAdmin)
                this.SendMessage(ActivePlayerStructs[i].socket, SenderName, Content, SenderId);
        }
    }

    HandleChatMessage(data) {
        // Verify User based on ID
        let UserIndex = Modules.Player.FindUserId(data.userId);
        if (UserIndex == -1) {
            return; // Reject attempts without UserId
        }
        if (data.userSecret != Modules.Player.Get(data.userId).userSecret) {
            return; // Reject attempts with an incorrect Secret Token
        }
        data.message = Modules.Utility.SimplifyChat(Modules.Utility.CensorSwears(data.message)); // Remove Issues with Chat Messages
        
        this.Log(chalk.magenta(`${Modules.Player.Get(data.userId).username} (${data.userId} | ${Modules.Player.Get(data.userId).machine}) : ${data.message}`))

        if (data.message.startsWith(Config.information.commandPrefix)) {
            // Send to command handler
            Modules.Command.HandleCommandMessage(data, Modules.Player.Get(data.userId).socket);
            return;
        }

        // ELSE SEND TO ALL
        this.BroadcastMessage(Modules.Player.Get(data.userId).username, data.message, data.userId);
        // let ActivePlayerStructs = Modules.Player.ActivePlayerStructs;
        // for (let i = 0; i < ActivePlayerStructs.length; i++) {
        //     if (data.userId != ActivePlayerStructs[i].userId) {
        //         // Format: -> Start of Chat Chunk @ username # message &
        //         // NOTE: ALL PACKET CHUNKS TERMINATE WITH & SYMBOL
        //         this.SendMessage(ActivePlayerStructs[i].userId, Modules.Player.Get(data.userId).username, data.message);
        //     }
        // }
    }
}