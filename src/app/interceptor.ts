import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export class LoginInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(req);

    const clone = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return next.handle(clone);
  }

}
