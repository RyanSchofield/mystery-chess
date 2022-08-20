import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  public messages: any[] = [];
  public currentMessage?: string;
  // public username: string = 'test';

  @Input() username?: string;

  @Input() socket: any;

  constructor() { }

  ngOnInit(): void {
    this._initializeSocket();
  }

  public sendMessage(event: any) {
    if (!this.currentMessage) return;
    console.log(this.currentMessage);
    this.socket.emit("message", {
      username: this.username,
      content: this.currentMessage
    });
    this.currentMessage = '';
  }

  private _initializeSocket() {
		this.socket.on("messages", (data: any) => {
			console.log('messages', data);
      this.messages = data.messages;
      console.log(this.messages);
		});
	}

}

/**
 * Let this.messages be an array of message objects, which have user and message properties.
 * Let username be an input, that will set this.username.
 * Display messages in template, along with textfield for message, and a send button.
 * Listen to the server upone initializing component.
 * Implement this.onSend(string: user, string: message) that takes message data and emits a socket event with the move data.
 * 
 */