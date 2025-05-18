import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../services/course.service'; // Adjust path to your service
import { AuthService } from '../services/auth.service'; // Adjust path to your AuthService
import { Router, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of, throwError } from 'rxjs'; // Import forkJoin, of, and throwError
import { catchError, map, switchMap } from 'rxjs/operators'; // Import operators

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading spinner

// Assuming you have a Course interface defined, e.g., in course.model.ts
import { Course } from '../models/course.model'; // Adjust the path if needed

@Component({
  selector: 'app-my-courses',
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
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css']
})
export class MyCoursesComponent implements OnInit, OnDestroy {
  myCourses: Course[] = []; // Use the Course interface and initialize as empty array
  isLoading = true; // Loading indicator
  userId: number | null = null; // Current user's ID
  userRole: string | null = null; // Current user's role

  private subscriptions: Subscription = new Subscription(); // Manage subscriptions

  constructor(
    private courseService: CourseService, // Inject CourseService
    private authService: AuthService, // Inject AuthService
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
          // Fetch enrolled courses only if the user is a student
          if (this.userRole === 'student') {
             this.loadMyCourses(this.userId); // userId is guaranteed to be number here due to the 'if (user)' check
          } else {
             // Optional: Redirect non-students or show a message
             console.warn('Non-student user accessing My Courses page. Redirecting.');
             this.router.navigate(['/courses']); // Redirect teachers or others
          }
        } else {
          // Handle case where user is not logged in (AuthGuard should handle this)
          this.userId = null;
          this.userRole = null;
          this.myCourses = []; // Clear courses if user logs out
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
   * Loads the courses the current student is enrolled in.
   * Fetches enrolled course IDs and then filters all courses.
   * @param userId The ID of the current user (student).
   */
  loadMyCourses(userId: number): void { // Parameter userId is number here
      this.isLoading = true;

      // Define the expected type for the result of forkJoin
      interface CombinedData {
          allCourses: Course[];
          enrolledIds: number[];
      }

      // Use forkJoin to fetch all courses and enrolled IDs in parallel
      const combined = forkJoin({
          allCourses: this.courseService.getAllCourses().pipe(
              catchError(error => {
                  console.error("Error fetching all courses", error);
                  this.openSnackBar('שגיאה בטעינת הקורסים.', 'סגור', 5000);
                  return throwError(() => new Error(error));
              })
          ),
          // Fetch enrolled course IDs only if the user is a student
          // Use the non-null assertion operator (!) because we know userId is not null here
          enrolledIds: this.userRole === 'student' && this.userId !== null // Double check is good practice
                       ? this.courseService.getEnrolledCourseIdsByUserId(this.userId!).pipe( // <--- Added '!' here
                           catchError(error => {
                               console.error("Error fetching enrolled course IDs", error);
                               this.openSnackBar('שגיאה בטעינת קורסים רשומים.', 'סגור', 5000);
                               return throwError(() => new Error(error));
                           })
                         )
                       : of([]) // If not a student or userId is null, return an observable of an empty array
      });

      this.subscriptions.add( // Add combined subscription to manage it
          // Provide the type annotation for the 'results' parameter
          combined.subscribe({
              next: (results: CombinedData) => {
                  // Filter all courses to get only the enrolled ones
                  this.myCourses = results.allCourses.filter(course =>
                      results.enrolledIds.includes(course.id)
                  );
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
