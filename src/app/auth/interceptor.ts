import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // נתיב לשירות האותנטיקציה שלך
console.log('Interceptor is running');
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {  console.log('&&&&& AuthInterceptor is being constructed! &&&&&&');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    console.log('Token:', token);
    if (token) {

      const authReq = request.clone({
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      });
      console.log('Headers:', authReq.headers);
      return next.handle(authReq);
    } else {
      return next.handle(request); // המשך כרגיל אם אין אסימון
    }
  }
}