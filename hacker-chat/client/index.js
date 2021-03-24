/**
 * node index.js
 *    --username raphacapeto
 *    --room sala01
 *    --hostUri: localhost
 * 
 */

import Event from 'events';
import { TerminalController } from "./src/terminalController.js";
import { CliConfig } from './src/cliConfig.js';
import { SocketClient } from './src/socket.js';
import { EventManager } from './src/eventManager.js';

const [nodePath, filePath, ...commands] = process.argv;

const config = CliConfig.parseArguments(commands);
console.log('config', config);

const componentEmitter = new Event();

const socketClient = new SocketClient(config);
await socketClient.initialize();

const data = {
   roomId: config.room,
   userName: config.username
}

const eventManager = new EventManager({ componentEmitter, socketClient });

const events = eventManager.getEvents();
socketClient.attachEvents(events);

eventManager.joinRoomAndWaitForMessages(data);

const controller = new TerminalController();
await controller.initializeTable(componentEmitter);