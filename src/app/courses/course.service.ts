import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of, timer } from 'rxjs';
import { catchError, map, retry, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

export interface Student {
  id: number;
  name: string;
  email: string;
}

export interface Course {
  id: number;
  title: string;
  name?: string; // For backward compatibility
  description: string;
  teacherId: number;
  teacherName?: string;
  enrolled?: boolean;
  enrolledStudents?: number;
  students?: Student[];
  startDate?: Date | string;
  endDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // New properties for enhanced course card
  category?: string;
  isNew?: boolean;
  progress?: number;
  duration?: number;
  level?: 'מתחיל' | 'בינוני' | 'מתקדם' | 'מומחה';
  rating?: number;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  
  // For internal use
  _highlighted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly apiUrl = 'http://localhost:3000/api/courses';
  private cache$: Observable<Course[]> | null = null;
  private lastFetchTime = 0;
  private coursesSubject = new BehaviorSubject<Course[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get all courses with caching
   * @param forceRefresh Force refresh the cache
   */
  getCourses(forceRefresh = false): Observable<Course[]> {
    const now = Date.now();
    
    // If cache is invalid or force refresh is requested
    if (forceRefresh || !this.cache$ || now - this.lastFetchTime > CACHE_DURATION) {
      this.lastFetchTime = now;
      this.cache$ = this.http.get<Course[]>(this.apiUrl).pipe(
        tap(courses => this.coursesSubject.next(courses)),
        shareReplay(1),
        catchError(this.handleError<Course[]>('getCourses', []))
      );
    }
    
    return this.cache$;
  }
  
  /**
   * Get a single course by ID
   */
  getCourse(courseId: number): Observable<Course | undefined> {
    return this.getCourses().pipe(
      map(courses => courses.find(c => c.id === courseId)),
      catchError(this.handleError<Course | undefined>('getCourse', undefined))
    );
  }

  // שליפת קורס ספציפי לפי מזהה
  getCourseById(courseId: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${courseId}`);
  }

  // Enroll a user in a course
  enrollInCourse(courseId: number, userId: number | null): Observable<void> {
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    // Create a proper student object with the minimum required fields
    const studentPayload = {
      id: userId,
      name: 'User ' + userId, // This will be updated from the server
      email: `user${userId}@example.com` // This will be updated from the server
    };
    
    return this.http.post<void>(`${this.apiUrl}/${courseId}/enroll`, { 
      userId,
      student: studentPayload
    });
  }
  


  // ביטול הרשמת משתמש נוכחי מקורס
  unenrollStudent(courseId: number): Observable<void> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    return this.http.request<void>('delete', `${this.apiUrl}/${courseId}/unenroll`, {
      body: { userId }
    });
  }

  /**
   * Create a new course (teachers only)
   * Invalidates the cache after creation
   */
  createCourse(title: string, description: string): Observable<Course> {
    const teacherId = this.authService.getUserId();
    if (!teacherId) {
      return throwError(() => new Error('User not logged in'));
    }
    
    return this.http.post<Course>(this.apiUrl, { title, description, teacherId }).pipe(
      tap(() => {
        // Invalidate cache after creation
        this.cache$ = null;
      }),
      catchError(this.handleError<Course>('createCourse'))
    );
  }

  // עדכון קורס קיים
  updateCourse(id: number, title: string, description: string): Observable<Course> {
    const teacherId = this.authService.getUserId();
    if (!teacherId) {
      return throwError(() => new Error('User not logged in'));
    }
    return this.http.put<Course>(`${this.apiUrl}/${id}`, { title, description, teacherId });
  }

  /**
   * Delete a course
   * Invalidates the cache after deletion
   */
  deleteCourse(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${courseId}`).pipe(
      tap(() => {
        // Invalidate cache after deletion
        this.cache$ = null;
        // Update the subject
        const currentCourses = this.coursesSubject.value;
        this.coursesSubject.next(currentCourses.filter(c => c.id !== courseId));
      }),
      catchError(this.handleError<void>('deleteCourse'))
    );
  }
  
  /**
   * Handle HTTP errors
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'An error occurred';
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else if (error.status) {
        // Server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      
      // Return default error message or custom message from server
      const serverMessage = error.error?.message || errorMessage;
      return throwError(() => new Error(serverMessage));
    };
  }

  // Filter courses based on user permissions
  filterUserCourses(courses: Course[], showOnlyMine: boolean): Course[] {
    if (!showOnlyMine) return [...courses];
    
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();

    if (!userId) return [];

    if (userRole === 'teacher') {
      return courses.filter(course => course.teacherId === userId);
    } else if (userRole === 'student') {
      return courses.filter(course => {
        // Check if the course has the enrolled flag set
        if (typeof course.enrolled !== 'undefined') {
          return course.enrolled === true;
        }
        
        // Check if the students array contains the user's ID
        if (Array.isArray(course.students)) {
          return course.students.some(student => {
            // Handle both Student objects and plain user IDs
            if (typeof student === 'object' && student !== null) {
              return student.id === userId;
            }
            return student === userId;
          });
        }
        
        return false;
      });
    }
    
    return [];
  }
}