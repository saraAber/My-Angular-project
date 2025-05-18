import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { Course } from '../models/course.model';
import { Lesson } from '../models/lesson.model'; // Import the Lesson interface

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
   private usersUrl = `${this.apiUrl}/users`; // Assuming users API base URL

  constructor(private http: HttpClient) { }

  // *** Recommendation: Use an Http Interceptor instead of manually adding headers here ***
  // private getAuthHeaders(): HttpHeaders {
  //   const token = sessionStorage.getItem('authToken'); // Ensure you're using the correct storage key
  //   return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  // }
  // If you are using an Interceptor, you can remove the headers parameter from the http calls below.


  getAllCourses(): Observable<Course[]> {
    // Removed headers parameter if using Interceptor
    return this.http.get<Course[]>(this.coursesUrl).pipe(
      catchError(this.handleError)
    );
  }

  getCourseById(id: number): Observable<Course> {
    // Removed headers parameter if using Interceptor
    return this.http.get<Course>(`${this.coursesUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Fetches all lessons for a specific course.
   * API: GET http://localhost:3000/api/courses/:courseId/lessons
   * @param courseId The ID of the course.
   * @returns Observable<Lesson[]> - An observable of an array of lessons.
   */
  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
     // Removed headers parameter if using Interceptor
     return this.http.get<Lesson[]>(`${this.coursesUrl}/${courseId}/lessons`).pipe(
       catchError(this.handleError)
     );
  }

  /**
   * Fetches details for a specific lesson within a course.
   * API: GET http://localhost:3000/api/courses/:courseId/lessons/:id
   * @param courseId The ID of the course the lesson belongs to.
   * @param lessonId The ID of the lesson.
   * @returns Observable<Lesson> - An observable of the lesson details.
   */
  getLessonById(courseId: number, lessonId: number): Observable<Lesson> {
     // Removed headers parameter if using Interceptor
     return this.http.get<Lesson>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}`).pipe(
       catchError(this.handleError)
     );
  }

   /**
    * Creates a new lesson for a specific course.
    * API: POST http://localhost:3000/api/courses/:courseId/lessons
    * @param courseId The ID of the course the lesson belongs to.
    * @param lessonData The data for the new lesson (title, content).
    * @returns Observable<any> - An observable for the creation request.
    */
   createLesson(courseId: number, lessonData: Omit<Lesson, 'id'>): Observable<any> {
       // Removed headers parameter if using Interceptor
       return this.http.post(`${this.coursesUrl}/${courseId}/lessons`, lessonData).pipe(
           catchError(this.handleError)
       );
   }

   /**
    * Updates an existing lesson within a course.
    * API: PUT http://localhost:3000/api/courses/:courseId/lessons/:id
    * @param courseId The ID of the course the lesson belongs to.
    * @param lessonId The ID of the lesson to update.
    * @param lessonData The updated data for the lesson (title, content).
    * @returns Observable<any> - An observable for the update request.
    */
   updateLesson(courseId: number, lessonId: number, lessonData: Omit<Lesson, 'id'>): Observable<any> {
       // Removed headers parameter if using Interceptor
       return this.http.put(`${this.coursesUrl}/${courseId}/lessons/${lessonId}`, lessonData).pipe(
           catchError(this.handleError)
       );
   }

   /**
    * Deletes a lesson within a course.
    * API: DELETE http://localhost:3000/api/courses/:courseId/lessons/:id
    * @param courseId The ID of the course the lesson belongs to.
    * @param lessonId The ID of the lesson to delete.
    * @returns Observable<any> - An observable for the delete request.
    */
   deleteLesson(courseId: number, lessonId: number): Observable<any> {
       // DELETE request with a body is not standard, but if your API requires it,
       // you'd need to pass an options object like in unenrollFromCourse.
       // Assuming a standard DELETE without body for now.
       // Removed headers parameter if using Interceptor
       return this.http.delete(`${this.coursesUrl}/${courseId}/lessons/${lessonId}`).pipe(
           catchError(this.handleError)
       );
   }

   /**
    * Fetches the IDs of courses a specific user is enrolled in.
    * This requires a backend endpoint like GET /api/users/:userId/enrolled-courses
    * @param userId The ID of the user (student).
    * @returns Observable<number[]> - An observable of an array of course IDs.
    */
   getEnrolledCourseIdsByUserId(userId: number): Observable<number[]> {
       // Assuming a backend endpoint exists at /api/users/:userId/enrolled-courses
       // that returns an array of course IDs like [1, 5, 10]
       // If your backend endpoint is different, adjust the URL here.
       // Removed headers parameter if using Interceptor
       return this.http.get<number[]>(`${this.usersUrl}/${userId}/enrolled-courses`).pipe(
           catchError(this.handleError)
       );
   }


  // Placeholder for checking enrollment status - requires backend implementation
  checkEnrollmentStatus(courseId: number, userId: number): Observable<EnrollmentStatus> {
    // This is a placeholder. You'll need to create a server endpoint to check this.
    // The server should return a 200 with { isEnrolled: true } or a 404.
    // Removed headers parameter if using Interceptor
    return this.http.get<EnrollmentStatus>(`${this.coursesUrl}/${courseId}/enrollment-status?userId=${userId}`)
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
     // Removed headers parameter if using Interceptor
    return this.http.post(`${this.coursesUrl}/${courseId}/enroll`, body).pipe(
      catchError(this.handleError),
      // Removed alert() - handled by component using MatSnackBar
      // tap(() => alert('נרשמת לקורס בהצלחה!'))
    );
  }
  unenrollFromCourse(courseId: number, userId: number): Observable<any> {
    const options = {
      // Removed headers parameter if using Interceptor
      // headers: this.getAuthHeaders(),
      body: { userId: userId } // DELETE request with a body requires options object
    };
    return this.http.delete(`${this.coursesUrl}/${courseId}/unenroll`, options).pipe(
      catchError(this.handleError),
      // Removed alert() - handled by component using MatSnackBar
      // tap(() => alert('הנך נמחקת מהקורס בהצלחה'))
    );
  }

  createCourse(courseData: Omit<Course, 'id'>): Observable<any> {
     // Removed headers parameter if using Interceptor
    return this.http.post(this.coursesUrl, courseData).pipe(
      catchError(this.handleError)
    );
  }

  updateCourse(courseId: number, courseData: Omit<Course, 'id'>): Observable<any> {
     // Removed headers parameter if using Interceptor
    return this.http.put(`${this.coursesUrl}/${courseId}`, courseData).pipe(
      catchError(this.handleError)
    );
  }

  deleteCourse(courseId: number): Observable<any> {
     // Removed headers parameter if using Interceptor
    return this.http.delete(`${this.coursesUrl}/${courseId}`).pipe(
      catchError(this.handleError)
    );
  }

   // Kept your existing handleError method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // The backend might return a specific error message in error.error or error.error.message
      errorMessage = `Server returned code ${error.status}, body was: ${error.error}`;
       // Try to get a more specific message from the backend response
       if (error.error && typeof error.error === 'object' && error.error.message) {
           errorMessage = `שגיאה מהשרת: ${error.error.message}`;
       } else if (typeof error.error === 'string') {
            errorMessage = `שגיאה מהשרת: ${error.error}`;
       } else {
            errorMessage = `שגיאה: ${error.statusText || 'Unknown Server Error'}`;
       }
    }
    console.error(errorMessage);
    // Re-throw the error with a potentially more user-friendly message
    return throwError(() => new Error(errorMessage));
  }
}
