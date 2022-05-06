import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'google-login';
  user$ = new  BehaviorSubject<SocialUser|null>(null);
  loaded$ = this.socialAuthService.initState.pipe(
    tap(r => console.log(r)
    )
  );

  messages$ = new BehaviorSubject<any[]>([]);

  roomId = '';


  constructor(private readonly socialAuthService: SocialAuthService,
    private readonly http : HttpClient,
    private readonly socketService: SocketService,
    private cookieService: CookieService
    ) {
  }

  messages :any[] = [];


  ngOnInit(){
     this.socialAuthService.authState.subscribe((user) => {
      this.user$.next(user);
      if(user){
        this.loginAtBackend(user);
      }
    });

    this.socketService.getMessage().subscribe(
      data => this.messages = [...this.messages, data]
    )

    this.socketService.getError().subscribe(
      data => {
        console.log(data)
        alert(data.message);
      }
    )

  }

  loginWithGoogle(){
this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID, {

})
  }

  logOut(): void {
    this.socialAuthService.signOut(true).then(
      _=> {
        this.http.post('http://localhost:3000/auth/logout', null, {headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }}).subscribe(
      (d: any) => {

        this.user$.next('Logout successful' as any)}
    )
      }
    ).catch(e => console.log("not logged in"));
  }

  trackBy = (data: any) => {
    return data._id;
  }


  loginAtBackend(socialUser: SocialUser){
    const {authToken: accessToken} = socialUser;
    this.http.post('http://localhost:3000/auth/google',{accessToken, type: '6261c67ab6b8e5f0824ed049'}, {

    }).subscribe(
      (d:any) => {
        localStorage.setItem('token', d.accessToken);
        this.cookieService.set('Authorization', d.accessToken);
        this.socketService.connect();
        this.user$.next(d as any)}
    )
  }
  sendMessage(message: string){
    const messageData = {
      room: this.roomId,
      content: message,
      type: 'text'
    }
    this.socketService.sendMessage(messageData);
  }

  joinRoom(roomId: string){
    this.roomId = roomId;
    this.socketService.joinRoom(roomId);
     this.http.get('http://localhost:3000/messaging/'+roomId).subscribe(
      (data:any) => {
        const messages = data.map((v: any) => (v.messages));
        console.log(messages);
        this.messages = [...this.messages, ...messages[0]];

      }
    )
  }

  getRooms(){
    this.http.get('http://localhost:3000/messaging').subscribe(
      d => this.user$.next(d as any)
    )
  }


}
