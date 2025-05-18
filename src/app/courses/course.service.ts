import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { Course } from './course.model';

export interface EnrollmentStatus {
  isEnrolled: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api';
  private coursesUrl = `${this.apiUrl}/courses`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('authToken');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.coursesUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.coursesUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  checkEnrollmentStatus(courseId: number, userId: number): Observable<EnrollmentStatus> {
    // This is a placeholder.  You'll need to create a server endpoint to check this.
    //  The server should return a 200 with { isEnrolled: true } or a 404.
    return this.http.get<EnrollmentStatus>(`${this.coursesUrl}/${courseId}/enrollment-status?userId=${userId}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            return of({ isEnrolled: false }); // Not enrolled
          }
          return this.handleError(error); // Propagate other errors
        })
      );
  }

  enrollInCourse(courseId: number, userId: number): Observable<any> {
    const body = { userId: userId };
    return this.http.post(`${this.coursesUrl}/${courseId}/enroll`, body, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError),
      tap(() => alert('נרשמת לקורס בהצלחה!'))
    );
  }
  unenrollFromCourse(courseId: number, userId: number): Observable<any> {
    const options = {
      headers: this.getAuthHeaders(),
      body: { userId: userId }
    };
    return this.http.delete(`${this.coursesUrl}/${courseId}/unenroll`, options).pipe(
      catchError(this.handleError),
      tap(() => alert('הנך נמחקת מהקורס בהצלחה'))
    );
  }

  createCourse(courseData: Omit<Course, 'id'>): Observable<any> {
    return this.http.post(this.coursesUrl, courseData, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateCourse(courseId: number, courseData: Omit<Course, 'id'>): Observable<any> {
    return this.http.put(`${this.coursesUrl}/${courseId}`, courseData, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(`${this.coursesUrl}/${courseId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}, body was: ${error.error}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}


// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Course } from '../courses/course.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class CourseService {
//   private apiUrl = 'http://localhost:3000/api';
//   private coursesUrl = `${this.apiUrl}/courses`;

//   constructor(private http: HttpClient) { }

//   getAllCourses(): Observable<Course[]> {
//     console.log('CourseService.getAllCourses() is being called with manual token...');
//     const token = localStorage.getItem('authToken'); // ודא שזה המפתח שבו האסימון מאוחסן אחרי התחברות

//     let headers = new HttpHeaders();

//     if (token) {
//       headers = headers.set('Authorization', `Bearer ${token}`);
//       console.log('Authorization header added manually:', headers);
//     } else {
//       console.warn('No token found in localStorage.');
//     }

//     return this.http.get<Course[]>(this.coursesUrl, { headers });
//   }

//   // ... (אם יש מתודות אחרות שצריכות אימות, תצטרך לשנות אותן באופן דומה)
// }


// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// // Assuming Course interface is defined in course.model.ts
// // If the file is located elsewhere, adjust the path accordingly
// import { Course } from '../courses/course.model'; // ודא שייבאת את Course

// interface EnrollmentResponse {
//   message: string;
//   // יכולים להיות שדות נוספים בתגובה מהשרת
// }

// @Injectable({ // הוסף את הדקורטור @Injectable
//   providedIn: 'root'
// })
// export class CourseService {
//   private apiUrl = 'http://localhost:3000/api'; // עדכן לכתובת ה-API של השרת שלך
//   private coursesUrl = `${this.apiUrl}/courses`;
//   private enrollmentsUrl = `${this.apiUrl}/enrollments`; // Endpoint להרשמה

//   constructor(private http: HttpClient) { }

//   getAllCourses(): Observable<Course[]> { // תקן את סוג ההחזרה ל-Course[]
//     console.log('CourseService.getAllCourses() is being called...');
//     return this.http.get<Course[]>(this.coursesUrl);
//   }
    

//   getCourseById(id: number): Observable<Course | undefined> {
//     return this.http.get<Course>(`${this.coursesUrl}/${id}`);
//   }

//   enrollInCourse(courseId: number): Observable<EnrollmentResponse> {
//     // גוף הבקשה שנשלח לשרת
//     const body = { courseId: courseId };
//     // בקשת POST לשרת
//     return this.http.post<EnrollmentResponse>(this.enrollmentsUrl, body);
//   }
// }