import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class CommandModule extends ServerModule {
    Commands = {}

    async LoadModule() {
        await this.RegisterCommands();
    }

    async UnloadModule() {
        this.UnregisterCommands();
    }

    async RegisterCommands() {
        this.Log(chalk.cyanBright("Registering Commands..."))

        // Register Each Module
        this.Commands = [];
        const CommandFiles = await globSync(`${path.join(__dirname, './*/*.js')}`.replace(/\\/g, '/')).reverse();
        for (let i = 0; i < CommandFiles.length; i++) {
            const filePath = CommandFiles[i];
            try {
                const NewCommand = await Modules.ImportFile(`file:///${filePath}`);

                const CommandInstance = new ChatCommand(NewCommand);

                this.Commands.push(CommandInstance);

                //this.Log(chalk.cyanBright(`Loaded Command | ${Config.information.commandPrefix}${CommandInstance.name}`));
            } catch (err) {
                this.Log(chalk.red(`Failed Loading Command ${filePath}`));
                this.Log(err)
            }
        }
        this.Log(chalk.cyanBright(`Finished Loading Commands. (${this.Commands.length}/${CommandFiles.length} Loaded, ${CommandFiles.length - this.Commands.length} Failures)`));
    }

    async UnregisterCommands() {
        this.Commands = [];

        // Simple, right?
        this.Log(chalk.cyanBright(`Successfully Unloaded All Commands.`));
    }

    async HandleCommandMessage(data, ws) {
        // First Try Names
        for (let i = 0; i < this.Commands.length; i++) {
            if (data.message == `${Config.information.commandPrefix}${this.Commands[i].name}` || data.message.startsWith(`${Config.information.commandPrefix}${this.Commands[i].name} `)) {
                if (!Modules.Permissions.CheckUserPermission(Modules.Player.Get(data.userId).machine, this.Commands[i].requiredPermissions) || !Modules.Command.Commands[i].AllowClient) {
                    Modules.Chat.SendMessage(ws, "<red>[Server]</>", `<red>You do not have permission to do this.</>`);
                } else {
                    this.Commands[i].callback(data.userId, data.message, ws);
                }
                return;
            }
        }

        // Next Try Aliases
        for (let i = 0; i < this.Commands.length; i++) {
            for (let l = 0; l < this.Commands[i].aliases.length; l++) {
                if (data.message == `${Config.information.commandPrefix}${this.Commands[i].aliases[l].name}` || data.message.startsWith(`${Config.information.commandPrefix}${this.Commands[i].aliases[l].name} `)) {
                    if (!Modules.Permissions.CheckUserPermission(Modules.Player.Get(data.userId).machine, this.Commands[i].requiredPermissions) || !Modules.Command.Commands[i].AllowClient) {
                        Modules.Chat.SendMessage(ws, "<red>[Server]</>", `<red>You do not have permission to do this.</>`);
                    } else {
                        this.Commands[i].callback(data.userId, data.message, ws);
                    }
                    return;
                }
            }
        }

        // Return Failure otherwise
        Modules.Chat.SendMessage(ws, "<red>[Server]</>", `<red>Couldn't find a Command with this Name.</>`);
        return;
    }
}

export class ChatCommand {
    name = ""

    aliases = []

    description = ""

    requiredPermissions = []

    callback = null

    AllowConsole = false

    AllowClient = false

    constructor(Structure) {
        if (!Structure.Name || Structure.RequiredPermissions == null || !Structure.Callback) {
            throw Error("Missing required Structure Element.");
        }

        this.name = Structure.Name;
        this.aliases = (Structure.Aliases ? Structure.Aliases : []);
        this.requiredPermissions = Structure.RequiredPermissions;
        this.callback = Structure.Callback;
        this.description = (Structure.Description ? Structure.Description : "")
        this.AllowClient = (Structure.AllowClient ? Structure.AllowClient : false)
        this.AllowConsole = (Structure.AllowConsole ? Structure.AllowConsole : false)
    }

    async Execute(...args) {
        if (this.callback)
            this.callback.apply(this, args);
    }

    Log(content) {
        console.log(`${chalk.cyan(`[Command-${this.constructor.name}]`)} ` + content);
    }
}