import { constants } from "./constants.js";

export class Controller {
   #users = new Map();
   #rooms = new Map();

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

   async joinRoom(socketId, data) {
      const userData = data;
      console.log(`${userData.userName} joined! ${[socketId]}`);

      const { roomId } = userData;
      const user = this.#updateGlobalUserData(socketId,  userData);
      const users = this.#joinUserOnRoom(roomId, user);

      const currentUsers = Array.from(users.values()).map(({ id, userName}) => ({ id, userName }));

      //atualiza o usuário que conectou sobre quais usuários já estão conectados na mesma sala
      this.socketServer.sendMessage(
         user.socket,
         constants.event.UPDATE_USERS,
         currentUsers
      );

      //avisar a rede toda que um novo usuario conectou-se
      this.broadCast({
         socketId,
         roomId,
         event: constants.event.NEW_USER_CONNECTED,
         message: { id: socketId, userName: userData.userName }
      });
   }

   broadCast({ socketId, roomId, event, message, includeCurrentSocket = false }) {
      const usersOnRoom = this.#rooms.get(roomId);

      for(const [key, user] of usersOnRoom) {
         if(!includeCurrentSocket && key === socketId) continue;

         this.socketServer.sendMessage(user.socket, event, message);
      }

   }//mandar mensagem para todos que estão na sala

   #joinUserOnRoom(roomId, user) {
      const usersOnRoom = this.#rooms.get(roomId) ?? new Map();
      usersOnRoom.set(user.id, user);
      this.#rooms.set(roomId, usersOnRoom);
      return usersOnRoom;
   }

   #logoutUser(id, roomId) {
      this.#users.delete(id);
      const userOnRoom = this.#rooms.get(roomId);
      userOnRoom.delete(id);
      this.#rooms.set(roomId, userOnRoom);
   }

   message(socketId, data) {
      const { userName, roomId } = this.#users.get(socketId);
      this.broadCast({
         roomId,
         socketId,
         event: constants.event.MESSAGE,
         message: { userName, message: data },
         includeCurrentSocket: true
      });
   }

   #onSocketClosed(id) {
      return _ => {
         const { userName, roomId } = this.#users.get(id);
         console.log(`${userName} disconnected!`);

         this.broadCast({
            roomId,
            message: { id, userName },
            socketId: id,
            event: constants.event.DISCONNECT_USER
         });

         this.#logoutUser(id, roomId);
      }
   }

   #onSocketData(id) {
      return data => {
         try {
            const { event, message } = JSON.parse(data);
            //this[event] => this.joinRoom()
            this[event](id, message);
         } catch(err) {
            console.error(`wrong event format!!`, data.toString());
         } 
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