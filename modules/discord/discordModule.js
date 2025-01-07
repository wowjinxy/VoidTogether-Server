import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import chalk from 'chalk';
import { Client, Events, GatewayIntentBits, PresenceUpdateStatus, WebhookClient, EmbedBuilder } from 'discord.js';

var client = null;
var webhookCli = null;

export default class DiscordModule extends ServerModule {

    richPresenceTimer = null;

    async LoadModule() {
        if (!(!Config.discord.botToken || Config.discord.botToken == ""))
            this.StartClient();

        if (!(!Config.discord.webhook || Config.discord.webhook == ""))
            this.StartWebhook();
    }

    async UnloadModule() {
        this.StopClient();
        this.StopWebhook();
    }

    // Discord Bot
    async StartClient() {
        // Creates the Discord Bot Login
        client = new Client({ intents: [GatewayIntentBits.Guilds] });

        client.once(Events.ClientReady, readyClient => {
            // Set Presence Timer, 15s
            this.richPresenceTimer = setInterval(this.UpdatePresence, 15 * 1000);
            this.UpdatePresence();

            this.Log(chalk.cyanBright(`Ready! Logged in as ${readyClient.user.tag}`));
        });

        client.login(Config.discord.botToken);
    }

    async StopClient() {
        // Clears Rich Presence Timer
        clearInterval(richPresenceTimer);
        richPresenceTimer = null;
        // Destroys the Client
        client.destroy();
        client = null;
    }

    async UpdatePresence() {
        let playerCount = Modules.Player.ActivePlayerStructs.length;
        client.user.setPresence({ activities: [{ name: `${playerCount}/${Config.information.maxPlayers} Players` }], status: PresenceUpdateStatus.Online });
    }

    // Discord Webhook for Logging
    async StartWebhook() {
        webhookCli = new WebhookClient({ url: Config.discord.webhook });
        this.SendWebsocket(0x3A9BF0, "Discord Module", "Logging Enabled!", "");
    }

    async StopWebhook() {
        webhookCli = null;
    }

    async SendWebsocket(color, author, title, description = null) {
        if (!webhookCli)
            return;

        var embed = new EmbedBuilder()
            .setAuthor({ name:author })
            .setTitle(title)
            .setColor(color);
        
        if (description) 
            embed.setDescription(description);

        webhookCli.send({
            embeds: [embed],
        });
    }
}