import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { Subscription, forkJoin } from 'rxjs'; // Import forkJoin
import { catchError, tap } from 'rxjs/operators'; // Import operators
import { throwError } from 'rxjs'; // Import throwError

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar'; // For displaying messages
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading spinner

// Assuming you have Course and Lesson interfaces defined and exported
// REMOVE the local interface definition if you have one in this file
import { Course } from '../../models/course.model'; // Adjust the path if needed based on your project structure
import { Lesson } from '../../models/lesson.model'; // Assuming you have a Lesson model/interface

@Component({
  selector: 'app-course-details',
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
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  course: Course | null = null; // Changed from undefined to null for consistency
  lessons: Lesson[] = []; // Initialize as empty array
  isLoading = true; // Loading indicator for the whole component
  private courseId: number | null = null;
  private subscriptions: Subscription = new Subscription(); // Use a single subscription object

  constructor(
    private route: ActivatedRoute, // Inject ActivatedRoute
    private courseService: CourseService, // Inject CourseService
    private router: Router, // Inject Router
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    // Get the courseId from the route parameters
    const routeSub = this.route.params.subscribe(params => {
      const id = params['id']; // Access parameter by name
      if (id) {
        this.courseId = Number(id); // Convert to number
        if (!isNaN(this.courseId)) {
           this.loadCourseDetailsAndLessons(this.courseId);
        } else {
           console.error('Invalid course ID in route parameters:', id);
           this.isLoading = false;
           this.snackBar.open('שגיאה: מזהה קורס לא תקין.', 'סגור', { duration: 5000 });
           this.router.navigate(['/courses']); // Redirect if ID is invalid
        }
      } else {
        console.error('Course ID not provided in route parameters.');
        this.isLoading = false;
        this.snackBar.open('שגיאה: מזהה קורס לא נמצא.', 'סגור', { duration: 5000 });
        this.router.navigate(['/courses']); // Redirect if ID is missing
      }
    });
    this.subscriptions.add(routeSub); // Add route subscription to the main subscription object
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions at once
    this.subscriptions.unsubscribe();
  }

  /**
   * Loads course details and lessons concurrently.
   * @param id The ID of the course.
   */
  loadCourseDetailsAndLessons(id: number): void {
      this.isLoading = true; // Start loading

      // Use forkJoin to load both course details and lessons in parallel
      const combined = forkJoin({
          course: this.courseService.getCourseById(id).pipe(
              catchError(error => {
                  console.error('Error loading course details:', error);
                  // Handle specific error types if needed (e.g., 404)
                  if (error.status === 404) {
                      this.snackBar.open('הקורס לא נמצא.', 'סגור', { duration: 5000 });
                      this.router.navigate(['/courses']); // Redirect if course not found
                  } else {
                      this.snackBar.open('שגיאה בטעינת פרטי הקורס.', 'סגור', { duration: 5000 });
                  }
                  return throwError(() => new Error('Failed to load course details')); // Re-throw error
              })
          ),
          lessons: this.courseService.getLessonsByCourseId(id).pipe(
               catchError(error => {
                  console.error('Error loading course lessons:', error);
                   this.snackBar.open('שגיאה בטעינת השיעורים.', 'סגור', { duration: 5000 });
                  return throwError(() => new Error('Failed to load course lessons')); // Re-throw error
              })
          )
      });

      const combinedSub = combined.subscribe({
          next: (results) => {
              this.course = results.course;
              this.lessons = results.lessons;
              this.isLoading = false; // Stop loading on success
          },
          error: (error) => {
              // Errors are handled in the individual catchError pipes,
              // but this block will be called if any of the observables in forkJoin fail
              console.error('Combined loading failed:', error);
              this.isLoading = false; // Stop loading on error
              // Specific error messages are shown by the catchError operators above
          }
      });

      this.subscriptions.add(combinedSub); // Add combined subscription
  }


  /**
   * Navigates to the lesson details page.
   * @param lessonId The ID of the lesson to view.
   */
  viewLessonDetails(lessonId: number): void {
    // Navigate to the lesson details page, passing courseId and lessonId
    if (this.courseId !== null) {
       // Assuming the route for lesson details is structured like '/courses/:courseId/lessons/:lessonId'
       this.router.navigate(['/courses', this.courseId, 'lessons', lessonId]);
    } else {
        console.error("Cannot navigate to lesson details: Course ID is missing.");
        this.snackBar.open('שגיאה בניווט לשיעור.', 'סגור', { duration: 3000 });
    }
  }

  // You can keep your existing loadCourseDetails method if you prefer
  // but loadCourseDetailsAndLessons is more efficient as it loads concurrently.
  // If keeping, ensure it also handles loading state and errors with MatSnackBar.
  // loadCourseDetails(id: number): void { ... }
}


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { ActivatedRoute, RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { CourseService } from '../course.service';
// import { Course } from '../course.model'; // ודא שיש לך מודל Course
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-course-details',
//   standalone: true,
//   imports: [CommonModule,RouterModule],
//   templateUrl: './course-details.component.html',
//   styleUrls: ['./course-details.component.css']
// })
// export class CourseDetailsComponent implements OnInit, OnDestroy {
//   course: Course | undefined;
//   private routeSubscription: Subscription | undefined;

//   constructor(
//     private route: ActivatedRoute,
//     private courseService: CourseService
//   ) { }

//   ngOnInit(): void {
//     this.routeSubscription = this.route.params.subscribe(params => {
//       const courseId = Number(params['id']);
//       if (!isNaN(courseId)) {
//         this.loadCourseDetails(courseId);
//       } else {
//         console.error('Invalid course ID in route:', params['id']);
//         // אפשר להציג כאן הודעה למשתמש על ID לא תקין
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     if (this.routeSubscription) {
//       this.routeSubscription.unsubscribe();
//     }
//   }

//   loadCourseDetails(id: number): void {
//     this.courseService.getCourseById(id).subscribe({
//       next: course => {
//         this.course = course;
//       },
//       error: error => {
//         console.error('Error loading course details:', error);
//         // כאן אפשר להוסיף טיפול שגיאה מתאים (הצגת הודעה למשתמש)
//       }
//     });
//   }
// }
