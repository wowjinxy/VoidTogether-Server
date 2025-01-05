// VoidTogether Server
// Websocket Powered, made by GatoDeveloper
// Blehhhhh
import chalk from 'chalk';
import { ModuleHandler } from './modules/moduleHandler.js';
import YamlConfig from 'node-yaml-config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const consoleHeader = [
    chalk.cyanBright(`VoidTogether Multiplayer - RPC Server`),
    ` `,
    chalk.cyanBright(`Version ${version} - by GatoDeveloper`),
    chalk.cyanBright(`= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =`),
];

export const Modules = new ModuleHandler();

export const Config = YamlConfig.load(path.join(__dirname, "./serverconf.yml"), 'properties');

(async () => {
    for (let i=0;i<consoleHeader.length;i++) {
        console.log(consoleHeader[i]);
    }

    // First, Initialize the Error Handler for Modules to prevent a sudden crash from one mishap
    await Modules.RegisterErrorHandler();

    // Register our modules
    await Modules.RegisterModules();

    // Start Websocket
    Modules.Socket.CreateWebsocket();
})()