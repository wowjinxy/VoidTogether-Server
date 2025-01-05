//import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This is in charge of loading modules
export class ModuleHandler {
    Running = {}

    constructor() {

    }

    async RegisterErrorHandler() {
        process.on('uncaughtException', (error, origin) => {
            console.log(chalk.red(error.stack));
        })
        
        process.on('unhandledRejection', (reason, promise) => {
            console.log(chalk.red(reason.stack));
        })

        console.log(chalk.cyanBright("Registered Error Callbacks, Crash Prevention Enabled"))
    }

    async RegisterModules() {
        console.log(chalk.cyanBright("Registering Server Modules..."))

        // Register Each Module
        this.Running = {};
        const ModuleFiles = await globSync(`${path.join(__dirname, './*/*.js')}`.replace(/\\/g, '/')).reverse();
        for (let i = 0; i < ModuleFiles.length; i++) {
            const filePath = ModuleFiles[i];
            try {
                const NewModule = await this.ImportFile(`file:///${filePath}`);

                const ModuleInstance = new NewModule();
                await ModuleInstance.LoadModule();

                this.Running[ModuleInstance.constructor.name] = ModuleInstance;
                let ObjectName = FirstCapital(ModuleInstance.constructor.name.toLowerCase().replace("module",""));
                Object.defineProperty(this, ObjectName, {
                    value: ModuleInstance,
                    writable: false,
                });

                console.log(chalk.cyanBright(`Loaded Module | ${ModuleInstance.constructor.name}`));
            } catch (err) {
                console.log(chalk.red(`Failed Loading Module ${filePath}`));
                console.log(err)
            }
        }
        console.log(chalk.cyanBright(`Finished Loading Modules. (${Object.keys(this.Running).length}/${ModuleFiles.length} Loaded, ${ModuleFiles.length - Object.keys(this.Running).length} Failures)`));
    }

    async UnregisterModules() {
        console.log(chalk.cyanBright("Unregistering Server Modules..."))

        const LoadedModules = Object.keys(this.Running);
        for (let i = 0; i < LoadedModules.length; i++) {
            try {
                const ModuleInstance = this.Running[LoadedModules[i]];

                await ModuleInstance.UnloadModule();

                console.log(chalk.cyanBright(`Unloaded Module | ${ModuleInstance.constructor.name}`));

                let ObjectName = FirstCapital(ModuleInstance.constructor.name.toLowerCase().replace("module",""));
                Object.defineProperty(this, ObjectName, {
                    value: null,
                    writable: false,
                });

                delete this.Running[LoadedModules[i]];
            } catch (err) {
                console.log(chalk.red(`Failed Unloading Module ${ModuleInstance.constructor.name}`));
                console.log(err)
            }
        }

        console.log(chalk.cyanBright(`Finished Unloading Modules. (${LoadedModules.length - Object.keys(this.Running).length}/${LoadedModules.length} Unloaded, ${Object.keys(this.Running).length} Failures)`));
    }

    async ImportFile(FilePath) {
        return (await import(FilePath))?.default;
    }

    Get(ModuleName) {
        return this.Running[ModuleName];
    }
}

export class ServerModule {
    constructor() {

    }

    async LoadModule() {

    }

    async UnloadModule() {

    }

    Log(content) {
        console.log(`${chalk.cyanBright(`[${this.constructor.name}]`)} ` + content)
    }
}

// Utility
function FirstCapital(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}