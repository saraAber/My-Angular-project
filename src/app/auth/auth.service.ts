// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, tap } from 'rxjs';

// interface LoginResponse {
//   token: string;
//   userId: number;
//   role: string; // לדוגמה, אם יש לך תפקידים שונים למשתמשים
//   // ... עוד פרטים מהשרת
// }

// interface RegisterResponse {
//   message: string;
//   // ... עוד פרטים מהשרת
// }
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = 'http://localhost:3000/api/auth'; // כתובת ה-API של השרת

//   constructor(private http: HttpClient) { }

//   login(credentials: { email: string; password: string }): Observable<LoginResponse> {
//     return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
//       tap((response: LoginResponse) => {
//         localStorage.setItem('authToken', response.token); // שמירת האסימון
//         // שמור גם את userId אם אתה צריך אותו
//         localStorage.setItem('userId', response.userId.toString());
//         localStorage.setItem('userRole', response.role); // שמירת ה-role אם תצטרך אותו בהמשך

//       })
//     );
//   }
//   getToken(): string | null {
//     return localStorage.getItem('authToken');
//   }
//   getRole(): string | null {
//     return localStorage.getItem('userRole');
//   }
//   register(userData: { name: string; email: string; password: string }): Observable<RegisterResponse> {
//     return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData);
//   }
//   // בהמשך נוסיף פונקציות נוספות כמו register, logout וכו'
// }
import { Injectable } from '@angular/core';  // ייבוא חסר תוקן
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  userId: number;
  role: string;
  // ... עוד פרטים מהשרת
}

interface RegisterResponse {
  message: string;
  // ... עוד פרטים מהשרת
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // כתובת ה-API של השרת

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        sessionStorage.setItem('authToken', response.token); // שמירה ב-sessionStorage
        sessionStorage.setItem('userId', response.userId.toString());
        sessionStorage.setItem('userRole', response.role);
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

    getUserId(): string | null {
    return sessionStorage.getItem('userId');
  }

  getRole(): string | null {
    return sessionStorage.getItem('userRole');
  }

  register(userData: { name: string; email: string; password: string; role: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
  }
}
