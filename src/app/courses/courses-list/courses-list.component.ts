import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service'; // Adjust path
import { AuthService } from '../../services/auth.service'; // Adjust path
import { Router, RouterModule } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs'; // Import forkJoin
import { catchError, tap, map } from 'rxjs/operators'; // Import operators
import { throwError } from 'rxjs';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading spinner

// Assuming you have a Course interface defined, e.g., in course.model.ts
import { Course } from '../../models/course.model'; // Adjust the path if needed


@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Angular Material Modules
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule
    // MatSnackBarModule should be imported in app.module.ts or app.config.ts
  ],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css']
})
 class CoursesListComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  isLoading = true; // Loading indicator
  userRole: string | null = null; // To store the current user's role
  userId: number | null = null; // To store the current user's ID
  enrolledCourseIds: number[] = []; // Store IDs of courses the user is enrolled in

  private subscriptions: Subscription = new Subscription(); // Manage subscriptions

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) { }

  ngOnInit(): void {
    // Subscribe to user changes to get role and ID
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.userId = user.id;
          this.userRole = user.role;
          // Fetch data only after user info is available
          this.loadCoursesAndEnrollmentStatus();
        } else {
          // Handle case where user is not logged in (AuthGuard should handle this)
          this.userId = null;
          this.userRole = null;
          this.courses = []; // Clear courses if user logs out
          this.enrolledCourseIds = []; // Clear enrolled courses
          this.isLoading = false;
           // Optional: Redirect to login if user is null, though AuthGuard is preferred
           // this.router.navigate(['/login']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Unsubscribe from all subscriptions
  }

  /**
   * Loads all courses and the current user's enrollment status concurrently.
   */
  loadCoursesAndEnrollmentStatus(): void {
      if (this.userId === null) {
          console.warn("Cannot load data: User ID is not available.");
          this.isLoading = false;
          return;
      }

      this.isLoading = true;

      // Use forkJoin to fetch courses and enrollment status in parallel
      const combined = forkJoin({
          courses: this.courseService.getAllCourses().pipe(
              catchError(error => {
                  console.error("Error fetching courses", error);
                  this.openSnackBar('שגיאה בטעינת הקורסים.', 'סגור', 5000);
                  return throwError(() => new Error(error));
              })
          ),
          // Fetch enrolled course IDs only if the user is a student
          enrolledIds: this.userRole === 'student'
                       ? this.courseService.getEnrolledCourseIdsByUserId(this.userId).pipe(
                           catchError(error => {
                               console.error("Error fetching enrolled course IDs", error);
                               this.openSnackBar('שגיאה בטעינת סטטוס הרשמה.', 'סגור', 5000);
                               return throwError(() => new Error(error));
                           })
                         )
                       : [] // If not a student, return an empty array
      });

      this.subscriptions.add( // Add combined subscription to manage it
          combined.subscribe({
              next: (results) => {
                  this.courses = results.courses;
                  this.enrolledCourseIds = results.enrolledIds; // Store enrolled IDs
                  this.isLoading = false;
              },
              error: (error) => {
                  // Errors are handled in the individual catchError pipes
                  console.error("Combined data loading failed:", error);
                  this.isLoading = false;
              }
          })
      );
  }


  /**
   * Navigates to the course details page.
   * @param courseId The ID of the course to view.
   */
  viewCourseDetails(courseId: number): void {
    this.router.navigate(['/courses', courseId]); // Navigate to /courses/:id
  }

  /**
   * Handles the enrollment of a student in a course.
   * @param courseId The ID of the course to enroll in.
   */
  enroll(courseId: number): void {
     if (this.userRole === 'student' && this.userId !== null) {
        // Optional: Check if user is already enrolled before attempting (using this.isEnrolled(courseId))
        // if (this.isEnrolled(courseId)) {
        //    this.openSnackBar('אתה כבר רשום לקורס זה.', 'סגור');
        //    return;
        // }

        this.subscriptions.add( // Add subscription to manage it
            this.courseService.enrollInCourse(courseId, this.userId).pipe(
                catchError(error => {
                    console.error('Enrollment failed', error);
                    let errorMessage = 'שגיאה בהרשמה לקורס.';
                    if (error.message) {
                        errorMessage = `שגיאה: ${error.message}`;
                    }
                    this.openSnackBar(errorMessage, 'סגור', 5000);
                    return throwError(() => new Error(error));
                })
            ).subscribe({
                next: (response) => {
                    console.log('Enrollment successful', response);
                    this.openSnackBar('נרשמת לקורס בהצלחה!', 'סגור', 3000); // Show success message
                    // Update the enrolledCourseIds array locally
                    if (!this.enrolledCourseIds.includes(courseId)) {
                        this.enrolledCourseIds.push(courseId);
                    }
                    // Optional: Refresh courses list if needed (less efficient)
                    // this.loadCoursesAndEnrollmentStatus();
                }
            })
        );
     } else if (this.userId === null) {
       console.error('User is not logged in.');
       this.openSnackBar('אנא התחבר כדי להירשם לקורס.', 'סגור', 5000);
       this.router.navigate(['/login']); // Redirect to login
    } else {
       console.warn('Only students can enroll in courses.');
       this.openSnackBar('רק סטודנטים יכולים להירשם לקורסים.', 'סגור', 5000);
    }
  }

  /**
   * Handles the unenrollment of a student from a course.
   * @param courseId The ID of the course to unenroll from.
   */
  unenroll(courseId: number): void {
    // Check if user is a student and logged in
     if (this.userRole === 'student' && this.userId !== null) {
        // Optional: Check if user is actually enrolled before attempting (using this.isEnrolled(courseId))
        // if (!this.isEnrolled(courseId)) {
        //     this.openSnackBar('אינך רשום לקורס זה.', 'סגור');
        //     return;
        // }

       this.subscriptions.add( // Add subscription to manage it
           this.courseService.unenrollFromCourse(courseId, this.userId).pipe(
             catchError(error => {
               console.error('Failed to unenroll from course:', error);
                let errorMessage = 'שגיאה בביטול ההרשמה לקורס.';
                if (error.message) {
                    errorMessage = `שגיאה: ${error.message}`;
                }
                this.openSnackBar(errorMessage, 'סגור', 5000);
               return throwError(() => new Error(error));
             })
           ).subscribe({
             next: () => {
               console.log(`Successfully unenrolled from course ${courseId}`);
               this.openSnackBar('ביטלת את ההרשמה לקורס בהצלחה.', 'סגור', 3000); // Show success message
               // Update the enrolledCourseIds array locally
               this.enrolledCourseIds = this.enrolledCourseIds.filter(id => id !== courseId);
               // Optional: Refresh courses list if needed (less efficient)
               // this.loadCoursesAndEnrollmentStatus();
             },
           })
       );
     } else if (this.userId === null) {
        console.error('User is not logged in.');
        this.openSnackBar('אנא התחבר כדי לבטל הרשמה לקורס.', 'סגור', 5000);
        this.router.navigate(['/login']); // Redirect to login
     } else {
        console.warn('Only students can unenroll from courses.');
        this.openSnackBar('רק סטודנטים יכולים לבטל הרשמה לקורסים.', 'סגור', 5000);
     }
  }

   /**
   * Helper method to check if the current user is a student (for template).
   */
  isStudent(): boolean {
    return this.userRole === 'student';
  }

  /**
   * Helper method to check if the current user is a teacher (for template).
   */
  isTeacher(): boolean {
    return this.userRole === 'teacher';
  }

  /**
   * Helper method to check if a student is already enrolled in a course.
   * Uses the locally stored enrolledCourseIds array.
   * @param courseId The ID of the course to check.
   * @returns boolean - True if the user is enrolled, false otherwise.
   */
  isEnrolled(courseId: number): boolean {
      // Check if the courseId exists in the enrolledCourseIds array
      return this.enrolledCourseIds.includes(courseId);
  }

    /**
    * Helper method to open MatSnackBar messages.
    * @param message The message to display.
    * @param action The action text for the snackbar button.
    * @param duration The duration in milliseconds.
    */
   openSnackBar(message: string, action: string = 'Close', duration: number = 3000): void {
       this.snackBar.open(message, action, {
           duration: duration,
           horizontalPosition: 'center',
           verticalPosition: 'bottom',
       });
   }

   // Note: handleHttpError is primarily handled by the AuthInterceptor
   // You can leave it here for other non-auth related HTTP errors if needed.
   // private handleHttpError(error: any, defaultMessage: string = 'An error occurred.'): void { ... }

}
function of(arg0: never[]): any {
  throw new Error('Function not implemented.');
}

