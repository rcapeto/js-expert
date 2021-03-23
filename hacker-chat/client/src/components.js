import blessed from 'blessed';

export class ComponentsBuilder {
   #screen;
   #layout;
   #input;
   #chat;
   #status;
   #activityLog;

   constructor() {}

   #baseComponent() {
      return {
         border: 'line',
         mouse: true,
         keys: true,
         top: 0,
         scrollbar: {
            ch: '',
            inverse: true,
         },
         tags: true //habilita colocar cores e tags no texto
      }
   }

   setScreen({ title }) {
      this.#screen = blessed.screen({
         smartCSR: true,
         title
      });
      this.#screen.key(['escape', 'q', 'C-c'], () => process.exit(0)); //se apertar esc, q ou ctrl + c fecha o terminal
      return this;
   }

   setLayoutComponent() {
      this.#layout = blessed.layout({
         parent: this.#screen,
         width: '100%',
         height: '100%'
      });

      return this;
   }

   setInputComponent(onEnterPressed) {
      const input = blessed.textarea({
         parent: this.#screen,
         bottom: 0,
         height: '10%',
         inputOnFocus: true,
         padding: {
            top: 1,
            left: 2
         },
         style: {
            fg: '#f6f6f6',
            bg: '#353535'
         }
      });

      input.key('enter', onEnterPressed);
      this.#input = input;
      return this;
   }

   setChatComponent() {
      this.#chat = blessed.list({
         ...this.#baseComponent(),
         parent: this.#layout,
         align: 'left',
         width: '50%',
         height: '90%', //porque o input está 10%,
         items: ['{bold}Messenger{/}']
      });

      return this;
   }

   setStatusComponent() {
      this.#activityLog = blessed.list({
         ...this.#baseComponent(),
         parent: this.#layout,
         height: '90%',
         width: '25%',
         style: {
            fg: 'yellow'
         },
         items: ['{bold}Activity Log{/}'],
      });
      return this;
   }

   setActivityLogComponent() {
      this.#status = blessed.list({
         ...this.#baseComponent(),
         parent: this.#layout,
         height: '90%',
         width: '25%',
         items: ['{bold}Users on Room{/}'],
      });
      return this;
   }

   build() {
      const components = {
         screen: this.#screen,
         input: this.#input,
         chat: this.#chat,
         activityLog: this.#activityLog,
         status: this.#status,
      }

      return components;
   }
}