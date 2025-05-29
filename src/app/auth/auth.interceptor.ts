// import { Injectable } from '@angular/core';
// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { AuthService } from './auth.service'; // נתיב לשירות האותנטיקציה של
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthInterceptor implements HttpInterceptor {
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // בדיקת מצב localStorage
//     console.log('--- INTERCEPTOR DEBUG ---');
//     console.log('Request URL:', req.url);
//     console.log('localStorage[token]:', localStorage.getItem('token'));
//     const token = localStorage.getItem('token');
//     console.log('Token sent:', token);
//     // נראה מה יישלח ב-Authorization
//     if (!!token) {
//       console.log('Authorization header:', 'Bearer ' + token);
//     } else {
//       console.log('No token found in localStorage!');
//     }
//     // בדיקה אם זו בקשת התחברות/הרשמה כדי שלא נשלח טוקן
//     const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

//     if (!!token && !isAuthRequest) {
//       const cloned = req.clone({
//         setHeaders: {
//           Authorization: 'Bearer ' + token
//         }
//       });
//       return next.handle(cloned);
//     }

//     return next.handle(req);
//   }
// }
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // נתיב לשירות האותנטיקציה שלך
console.log('Interceptor is running');
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {  console.log('&&&&& AuthInterceptor is being constructed! &&&&&&');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const isAuthRequest = request.url.includes('/auth/login') || request.url.includes('/auth/register');
    console.log('[INTERCEPTOR] Request URL:', request.url);
    console.log('[INTERCEPTOR] Token:', token);
    if (token && !isAuthRequest) {
      // הוסף את ה-Authorization ל-headers הקיימים בלבד
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('[INTERCEPTOR] Headers after clone:', authReq.headers.keys(), 'Authorization:', authReq.headers.get('Authorization'));
      return next.handle(authReq);
    } else {
      console.log('[INTERCEPTOR] No token or auth request. Sending original request.');
      return next.handle(request);
    }
  }
}