// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Observable, BehaviorSubject } from 'rxjs';

interface UserInfo {
  id: number | null;
  role: string;
  name: string | null;
  email: string | null;
  token: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000/api/auth';
private apiUser = 'http://localhost:3000/api/users';
  private userInfo = new BehaviorSubject<UserInfo>({
    id: null,
    role: 'guest',
    name: null,
    email: null,
    token: null
  });

  userInfo$ = this.userInfo.asObservable();

  constructor(private http: HttpClient) {
    this.initializeFromStorage();
  }

  // אתחול המשתמש מה-localStorage בלבד
  private initializeFromStorage(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    const userInfo: UserInfo = {
      id: this.getUserIdFromStorage(),
      role: this.getUserRoleFromToken(token),
      name: localStorage.getItem('name'),
      email: localStorage.getItem('email'),
      token
    };
    this.userInfo.next(userInfo);
  }

  /**
   * מחזיר את ה-userId של המשתמש הנוכחי
   */
  getUserId(): number | null {
    return this.userInfo.value.id;
  }

  getProfile(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return throwError(() => new Error('No user ID'));
    return this.http.get<any>(`${this.apiUser}/${userId}`);
  }

  updateProfile(data: { name: string; email: string }): Observable<any> {
    const userId = this.getUserId();
    if (!userId) return throwError(() => new Error('No user ID'));
    
    return this.http.put<any>(`${this.apiUser}/${userId}`, data).pipe(
      tap(() => {
        this.updateUserInfo({ name: data.name, email: data.email });
      })
    );
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.api}/login`, { email, password }).pipe(
      tap(res => {
        this.updateUserInfo({
          id: res.userId,
          role: res.role,
          name: res.name || null,
          email: res.email || null,
          token: res.token
        });
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Failed to login'));
      })
    );
  }
  
  register(data: any) {
    return this.http.post<any>(`${this.api}/register`, data).pipe(
      tap(res => {
        this.updateUserInfo({
          id: res.userId,
          role: res.role,
          name: data.name || null,
          email: data.email || null,
          token: res.token
        });
      })
    );
  }

  logout(): void {
    // מחק רק את המפתחות הרלוונטיים ל-auth
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    this.userInfo.next({
      id: null,
      role: 'guest',
      name: null,
      email: null,
      token: null
    });
  }

  isLoggedIn(): boolean {
    return !!this.userInfo.value.token;
  }

  // תמיד שלוף את הטוקן מ-localStorage בלבד
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string {
    return this.userInfo.value.role;
  }

  private updateUserInfo(updates: Partial<UserInfo>): void {
    const current = this.userInfo.value;
    const updated = { ...current, ...updates };
    // שמור תמיד ב-localStorage בלבד
    if (updates.token) localStorage.setItem('token', updates.token);
    if (updates.id) localStorage.setItem('userId', updates.id.toString());
    if (updates.role) localStorage.setItem('role', updates.role);
    if (updates.name) localStorage.setItem('name', updates.name);
    else if (updates.name === null) localStorage.removeItem('name');
    if (updates.email) localStorage.setItem('email', updates.email);
    else if (updates.email === null) localStorage.removeItem('email');
    this.userInfo.next(updated);
  }

  private getUserIdFromStorage(): number | null {
    const localUserId = localStorage.getItem('userId');
    if (localUserId) return Number(localUserId);
    
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ? Number(payload.userId) : null;
    } catch {
      return null;
    }
  }

  private getUserRoleFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'guest';
    } catch {
      return 'guest';
    }
  }
}
