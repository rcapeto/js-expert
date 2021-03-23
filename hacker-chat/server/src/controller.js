export class Controller {
   #users = new Map();

   constructor({ socketServer }) {
      this.socketServer = socketServer;
   }

   onNewConnection(socket) {
      const { id } = socket;
      console.log(`connection stablished with ${id}`);
      const userData = { id, socket };
      this.#updateGlobalUserData(id, userData);

      socket.on('data', this.#onSocketData(id));
      socket.on('end', this.#onSocketClosed(id));
      socket.on('error', this.#onSocketClosed(id));
   }

   #onSocketClosed(id) {
      return data => {
         console.log('data', data.toString());
      }
   }

   #onSocketData(id) {
      return data => {
         console.log('data', data.toString());
      }
   }

   #updateGlobalUserData(socketId, userData) {
      const users = this.#users;
      const user = users.get(socketId) ?? {};

      const updateUserData = Object.assign({}, user, userData);

      users.set(socketId, updateUserData);

      return users.get(socketId);
   }
}