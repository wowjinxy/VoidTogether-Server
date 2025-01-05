import { ServerModule } from '../moduleHandler.js';
import { Modules, Config } from '../../server.js';
import chalk from 'chalk';
import fs from 'fs';
import readline from 'readline';

export default class ConsoleModule extends ServerModule {
    rl = null;
    defaultLogFunction = null;

    async LoadModule () {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Overwrite existing console.log
        this.defaultLogFunction = console.log;
        console.log = function(...args) {
            readline.cursorTo(process.stdout, 0);
            readline.clearLine(process.stdout, 0);
            Modules.Console.defaultLogFunction.apply(console, arguments);
            Modules.Console.rl.prompt(true);
        }

        // Set up hooks
        this.rl.on("line",this.HandleUserInput);
        this.rl.on("close",process.exit);

        // Allow Input
        this.rl.setPrompt("");
        this.rl.prompt(true);
    }

    async UnloadModule () {

    }

    HandleUserInput(line) {
        // Handles running In-Game commands from the Console
        for (let i = 0; i < Modules.Command.Commands.length; i++) {
            if (line == `${Modules.Command.Commands[i].name}` || line.startsWith(`${Modules.Command.Commands[i].name} `)) {
                if (Modules.Command.Commands[i].AllowConsole)
                    Modules.Command.Commands[i].callback("console", line, null, true);
                else
                    Modules.Console.Log(chalk.red("This command can only be run by a player!"));
                return;
            }
        }

        // If all else fails, return invalid command
        Modules.Console.Log(chalk.red("Invalid Console Command!"));
    }
}