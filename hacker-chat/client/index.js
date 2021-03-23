/**
 * node index.js
 *    --username raphacapeto
 *    --room sala01
 *    --hostUri: localhost
 * 
 */

import Events from 'events';
import { TerminalController } from "./src/terminalController.js";
import { CliConfig } from './src/cliConfig.js';
import { SocketClient } from './src/socket.js';

const [nodePath, filePath, ...commands] = process.argv;
const config = CliConfig.parseArguments(commands);
console.log('config', config);
const componentEmitter = new Events();
const controller = new TerminalController();
const socketClient = new SocketClient(config);
await socketClient.initialize();

// await controller.initializeTable(componentEmitter);