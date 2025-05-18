import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

// Define interfaces for user data and auth response
interface User {
  id: number;
  name: string;
  email: string;
  role: string; // 'student' or 'teacher'
}

interface AuthResponse {
  token: string;
  userId: number;
  role: string;
  // Optional: Add name and email if returned by login API
  // userName?: string;
  // userEmail?: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Base URL for auth API

  // Use BehaviorSubject to track authentication state and user info
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Keep currentUserSubject private, but expose its value publicly
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable(); // Public observable

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Checks if a token exists in sessionStorage.
   * @returns boolean - true if token exists, false otherwise.
   */
  private hasToken(): boolean {
    // Check if token exists and is not expired (if using expiration)
    const token = sessionStorage.getItem('token');
    // Add logic here to check token expiration if applicable
    return !!token;
  }

  /**
   * Retrieves user information from sessionStorage.
   * @returns User | null - the user object or null if not found.
   */
  private getUserFromStorage(): User | null {
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName'); // Assuming you save name on login
    const userEmail = sessionStorage.getItem('userEmail'); // Assuming you save email on login
    const userRole = sessionStorage.getItem('userRole');

    if (userId && userName && userEmail && userRole) {
      return {
        id: +userId, // Convert to number
        name: userName,
        email: userEmail,
        role: userRole
      };
    }
    return null;
  }

  /**
   * Saves user information and token to sessionStorage.
   * @param authData - The authentication response data.
   */
  private saveAuthData(authData: AuthResponse): void {
    sessionStorage.setItem('token', authData.token);
    sessionStorage.setItem('userId', authData.userId.toString());
    sessionStorage.setItem('userRole', authData.role);
    // Optional: Save name and email if returned by login API
    // sessionStorage.setItem('userName', authData.userName || ''); // Use empty string if not returned
    // sessionStorage.setItem('userEmail', authData.userEmail || ''); // Use empty string if not returned

    // Update the BehaviorSubjects
    this.isAuthenticatedSubject.next(true);
    // Create a User object from authData for the currentUserSubject
    const user: User = {
        id: authData.userId,
        name: sessionStorage.getItem('userName') || 'משתמש', // Use saved name or default
        email: sessionStorage.getItem('userEmail') || '', // Use saved email or empty
        role: authData.role
    };
    this.currentUserSubject.next(user);
  }

  /**
   * Clears user information and token from sessionStorage.
   */
  private clearAuthData(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName'); // Clear optional data
    sessionStorage.removeItem('userEmail'); // Clear optional data

    // Update the BehaviorSubjects
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Registers a new user.
   * @param userData - The user registration data.
   * @returns Observable<any> - Observable for the registration request.
   */
  register(userData: RegisterPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        // Assuming register also returns token, userId, role upon success
        if (response.token && response.userId && response.role) {
             // Optional: Save name and email if returned by register API
             // response.userName = userData.name; // Assuming name is part of payload
             // response.userEmail = userData.email; // Assuming email is part of payload
             this.saveAuthData(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logs in an existing user.
   * @param credentials - The user login credentials.
   * @returns Observable<AuthResponse> - Observable for the login request.
   */
  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Assuming login API returns token, userId, role, name, email
        // Make sure your backend returns these fields in the response body
        // Example response structure: { token: '...', userId: 1, role: 'teacher', userName: '...', userEmail: '...' }
        sessionStorage.setItem('userName', (response as any).userName || credentials.email); // Save name or email
        sessionStorage.setItem('userEmail', credentials.email); // Save email
        this.saveAuthData(response); // Save auth data on successful login
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logs out the current user.
   */
  logout(): void {
    this.clearAuthData(); // Clear auth data
    this.router.navigate(['/login']); // Redirect to login page
  }

  /**
   * Get the current user's token.
   * @returns string | null - The token or null if not authenticated.
   */
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  /**
   * Get the current user's ID.
   * @returns number | null - The user ID or null if not authenticated.
   */
  getUserId(): number | null {
     const userId = sessionStorage.getItem('userId');
     return userId ? +userId : null;
  }

   /**
   * Get the current user's role.
   * @returns string | null - The user role ('student' or 'teacher') or null if not authenticated.
   */
  getUserRole(): string | null {
     return sessionStorage.getItem('userRole');
   }

   /**
    * Get the current user object value synchronously.
    * Useful for Guards and components that need the current state immediately.
    * @returns User | null - The current user object or null if not authenticated.
    */
   getCurrentUserValue(): User | null {
       return this.currentUserSubject.value; // Publicly expose the current value
   }


  /**
   * Helper method to handle HTTP errors.
   * @param error - The HTTP error response.
   * @returns Observable<never> - An observable that throws an error.
   */
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    // You can add more sophisticated error handling here, e.g., check error.status
    // Re-throw the error with a potentially more user-friendly message
     let errorMessage = 'Something went wrong; please try again later.';
     if (error.error && error.error.message) {
         errorMessage = error.error.message;
     } else if (error.message) {
         errorMessage = error.message;
     }
    return throwError(() => new Error(errorMessage));
  }
}
