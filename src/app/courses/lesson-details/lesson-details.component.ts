import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service'; // Import CourseService (or LessonService if you create one)
import { Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Assuming you have the Lesson interface defined and exported
import { Lesson } from '../../models/lesson.model'; // Adjust the path if needed

@Component({
  selector: 'app-lesson-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Angular Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
    // MatSnackBarModule should be imported in app.module.ts or app.config.ts
  ],
  templateUrl: './lesson-details.component.html',
  styleUrls: ['./lesson-details.component.css']
})
export class LessonDetailsComponent implements OnInit, OnDestroy {
  lesson: Lesson | null = null;
  isLoading = true;
  private courseId: number | null = null;
  private lessonId: number | null = null;
  private lessonSubscription: Subscription | undefined;
  private routeSubscription: Subscription | undefined;


  constructor(
    private route: ActivatedRoute, // Inject ActivatedRoute
    private courseService: CourseService, // Inject CourseService (or LessonService)
    private router: Router, // Inject Router
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    // Get courseId and lessonId from route parameters
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const courseIdParam = params.get('courseId');
      const lessonIdParam = params.get('lessonId');

      if (courseIdParam && lessonIdParam) {
        this.courseId = Number(courseIdParam);
        this.lessonId = Number(lessonIdParam);

        if (!isNaN(this.courseId) && !isNaN(this.lessonId)) {
          this.loadLessonDetails(this.courseId, this.lessonId);
        } else {
          console.error('Invalid course ID or lesson ID in route parameters.');
          this.isLoading = false;
          this.snackBar.open('שגיאה: מזהה קורס או שיעור לא תקין.', 'סגור', { duration: 5000 });
          this.router.navigate(['/courses']); // Redirect to courses list on invalid IDs
        }
      } else {
        console.error('Course ID or lesson ID not provided in route parameters.');
        this.isLoading = false;
        this.snackBar.open('שגיאה: מזהה קורס או שיעור חסר.', 'סגור', { duration: 5000 });
        this.router.navigate(['/courses']); // Redirect to courses list if IDs are missing
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from subscriptions
    if (this.lessonSubscription) {
      this.lessonSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
        this.routeSubscription.unsubscribe();
    }
  }

  /**
   * Fetches details for a specific lesson.
   * @param courseId The ID of the course the lesson belongs to.
   * @param lessonId The ID of the lesson.
   */
  loadLessonDetails(courseId: number, lessonId: number): void {
    this.isLoading = true;
    // Call the service method to get lesson details
    this.lessonSubscription = this.courseService.getLessonById(courseId, lessonId).pipe(
      catchError(error => {
        console.error('Error loading lesson details:', error);
        this.isLoading = false;
        let errorMessage = 'שגיאה בטעינת פרטי השיעור.';
        if (error.message) {
            errorMessage = `שגיאה: ${error.message}`;
        }
        this.snackBar.open(errorMessage, 'סגור', { duration: 5000 });
         // Optional: Redirect if lesson not found (e.g., 404 error)
         if (error.status === 404) {
             this.router.navigate(['/courses', courseId]); // Redirect back to course details
         }
        return throwError(() => new Error('Failed to load lesson details')); // Re-throw error
      })
    ).subscribe({
      next: (lesson:any) => {
        this.lesson = lesson;
        this.isLoading = false; // Stop loading on success
      }
    });
  }

  /**
   * Navigates back to the course details page.
   */
  goBackToCourse(): void {
    if (this.courseId !== null) {
      this.router.navigate(['/courses', this.courseId]);
    } else {
       console.error("Cannot go back to course: Course ID is missing.");
       this.snackBar.open('שגיאה בניווט חזרה לקורס.', 'סגור', { duration: 3000 });
       this.router.navigate(['/courses']); // Redirect to courses list as a fallback
    }
  }
}
