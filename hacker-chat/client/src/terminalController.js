import { ComponentsBuilder } from './components.js';
import { constants } from './constants.js';

export class TerminalController {
   #usersCollors = new Map();
   constructor() {}

   #pickCollor() {
      return `#${((1 << 24) * Math.random() | 0).toString(16)}-fg`;
   }

   #getUsersCollors(userName) {
      if(this.#usersCollors.has(userName)) 
         return this.#usersCollors.get(userName);
      
      const collor = this.#pickCollor();
      this.#usersCollors.set(userName, collor);

      return collor;
   }

   #onInputRecived(eventEmitter) {
      return function() {
         const message = this.getValue();//this => component
         console.log(message); 
         this.clearValue(); //this => component
      }
   }

   #onMessageReceived({ screen, chat }) {
      return msg => {
         const { userName, message } = msg;
         const collor = this.#getUsersCollors(userName);
         chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`);
         screen.render();
      }
   }

   #onLogChanged({ screen, activityLog }) {
      return msg => {
        const [userName] = msg.split(/\s/);
        const collor = this.#getUsersCollors(userName);

        activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`);
        screen.render();
      }
   }

   #onStausChanged({ screen, status }) {
      return users => {
         //pegar o primeiro elemento da lista:
         const { content } = status.items.shift(); //content => {bold}Activity Log{/}
         status.clearItems();
         status.addItem(content);

         users.forEach(userName => {
            const collor = this.#getUsersCollors(userName);
            status.addItem(`{${collor}}{bold}${userName}{/}`);
         });

         screen.render();
      }
   }

   #registerEvents(eventEmitter, components) {
      eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components));
      eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onLogChanged(components));
      eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStausChanged(components));
   }

   async initializeTable(eventEmitter) {
      const components = new ComponentsBuilder()
         .setScreen({ title: 'HackerChat - Raphael Capeto' })
         .setLayoutComponent()
         .setInputComponent(this.#onInputRecived(eventEmitter))
         .setChatComponent()
         .setActivityLogComponent()
         .setStatusComponent()
         .build();

      this.#registerEvents(eventEmitter, components);
      components.input.focus();
      components.screen.render();

      setInterval(() => {
         const users = ['raphacapeto'];
         eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
         users.push('maria');
         eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
         users.push('troll0012_');
         eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
      }, 2000);
   }
}