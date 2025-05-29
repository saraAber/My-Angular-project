import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("Intercepted request URL:", req.url); 
    const token = localStorage.getItem('token');
console.log("Token sent:", token);
    // בדיקה אם זו בקשת התחברות/הרשמה כדי שלא נשלח טוקן
    const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

    if (token && !isAuthRequest) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}