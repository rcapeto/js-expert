import { SocketServer } from './socket.js';
import Event from 'events';
import { constants } from './constants.js';
import { Controller } from './controller.js';

const port = process.env.PORT || 9898;
const eventEmmiter = new Event();

const socketServer = new SocketServer({ port });
const server = await socketServer.initialize(eventEmmiter);
console.log('socket server is running at', server.address().port);
const controller = new Controller({ socketServer });

eventEmmiter.on(constants.event.NEW_USER_CONNECTED, controller.onNewConnection.bind(controller));

/*
async function testeServer() {
   const options = {
      port: 9898,
      host: 'localhost',
      headers: {
         Connection: 'Upgrade',
         Upgrade: 'websocket'
      }
   }

   const http = await import('http');
   const req = http.request(options);
   req.end();

   req.on('upgrade', (res, socket) => {
      socket.on('data', data => {
         console.log('client received', data.toString());
      });

      setInterval(() => {
         socket.write('Hello');
      }, 500);
   });
}

eventEmmiter.on(constants.event.NEW_USER_CONNECTED, socket => {
   console.log('new connection', socket.id);
   socket.on('data', data => {
      console.log('client received', data.toString());
      socket.write('World!');
   });
});

await testeServer();

*/