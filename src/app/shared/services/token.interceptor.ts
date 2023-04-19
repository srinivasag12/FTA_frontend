import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  access_token: string;

  constructor(private cookieService:CookieService) {
    this.access_token=this.cookieService.get('access_token');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log(request);
    console.log(request.headers.has('InterceptorSkipHeader'));
    console.log(this.access_token);
    if(!(request.headers.has('InterceptorSkipHeader')) && request.url!=environment.api+"public/upload")
    {
      console.log("this.access_token",this.cookieService.get('access_token'));
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer '+this.cookieService.get('access_token')
        }
      });
    }
    
    return next.handle(request);
  }
}
