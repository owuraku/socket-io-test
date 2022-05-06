import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private readonly socket: Socket) {
    this.socket.fromOneTimeEvent('connected').then(() => alert('connected'))
  }

  sendMessage(msg: any) {
    this.socket.emit('send_message', msg);
  }

  getMessage() {
    return this.socket.fromEvent('receive_message').pipe(map((data: any) => data));
  }

  connect(){
    this.socket.connect()
  }


  joinRoom(room: string){
    this.socket.emit('join_room', room);
  }

  getError() {
    return this.socket.fromEvent('exception').pipe(map((data: any) => data));
  }



}
