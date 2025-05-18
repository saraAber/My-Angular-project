import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../course.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, catchError, throwError } from 'rxjs'; // Import catchError and throwError
import { CommonModule } from '@angular/common';

// Import Angular Material modules (assuming you have Angular Material installed)
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button'; // For dialog buttons
import { MatInputModule } from '@angular/material/input'; // For form inputs
import { MatFormFieldModule } from '@angular/material/form-field'; // For form fields
import { MatCardModule } from '@angular/material/card'; // For card layout
import { MatListModule } from '@angular/material/list'; // For lists

// Assuming a simple confirmation dialog component exists
// You would need to create this component or use a pre-built one
import { ConfirmationDialogComponent } from '../confirmation-dialog-component/confirmation-dialog-component.component';

import { Course } from '../course.model'; // או הנתיב הנכון לקובץ המודל שלך
@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // Angular Material Modules
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatListModule
  ],
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css']
})
export class CourseManagementComponent implements OnInit, OnDestroy {
  courseForm: FormGroup;
  courses: Course[] = [];
  isEditing = false;
  selectedCourseId: number | null = null;
  private coursesSubscription: Subscription | undefined;
  userId: number | null;
  userRole: string | null; // To store user role

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar, // Inject MatSnackBar
    private dialog: MatDialog // Inject MatDialog
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
    // Retrieve userId and userRole from sessionStorage
    this.userId = Number(sessionStorage.getItem('userId'));
    this.userRole = sessionStorage.getItem('userRole'); // Assuming role is stored here
  }

  ngOnInit(): void {
    // Check if user is a teacher, otherwise redirect
    if (this.userRole !== 'teacher') {
      console.warn('User is not a teacher, redirecting to courses page.');
      this.router.navigate(['/courses']); // Redirect to the courses list page
      return; // Stop further execution if not a teacher
    }
    this.getCourses();
  }

  ngOnDestroy(): void {
    if (this.coursesSubscription) {
      this.coursesSubscription.unsubscribe();
    }
  }

  /**
   * Fetches all courses from the service.
   */
  getCourses(): void {
    // Ensure userId exists before fetching courses (although role check above should cover this)
    if (!this.userId) {
        console.error("User not logged in or userId not found.");
        this.router.navigate(['/login']); // Redirect if userId is missing
        return;
    }

    this.coursesSubscription = this.courseService.getAllCourses().pipe(
      // Use catchError to handle errors and prevent the observable from breaking
      catchError(error => {
        console.error("Error fetching courses", error);
        this.handleHttpError(error); // Handle the error
        return throwError(() => new Error(error)); // Re-throw the error
      })
    ).subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      complete: () => {
        console.log("getCourses completed");
      }
    });
  }

  /**
   * Adds a new course.
   */
  addCourse(): void {
    // Check form validity, userId, and userRole before proceeding
    if (this.courseForm.valid && this.userId && this.userRole === 'teacher') {
      const courseData: Omit<Course, 'id'> = {
        title: this.courseForm.value.title,
        description: this.courseForm.value.description,
        teacherId: this.userId // Use number type
      };
      this.courseService.createCourse(courseData).pipe(
        catchError(error => {
          console.error("Error creating course", error);
          this.handleHttpError(error, 'Failed to create course.'); // Handle the error with a specific message
          return throwError(() => new Error(error));
        })
      ).subscribe({
        next: () => {
          this.getCourses(); // Refresh the list after adding
          this.courseForm.reset();
          this.openSnackBar('הקורס נוצר בהצלחה', 'סגור'); // Show success message
        },
        complete: () => {
          console.log("addCourse completed");
        }
      });
    } else {
      console.error("Form is invalid, user not logged in, or user is not a teacher.");
      if (!this.userId || this.userRole !== 'teacher') {
         this.router.navigate(['/login']); // Redirect if not authorized
      } else {
        this.openSnackBar('אנא מלא את כל השדות הנדרשים.', 'סגור'); // Show form validation message
      }
    }
  }

  /**
   * Selects a course for editing.
   * @param course The course to edit.
   */
  selectCourseForEdit(course: Course): void {
    this.isEditing = true;
    this.selectedCourseId = course.id;
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
    });
  }

  /**
   * Updates an existing course.
   */
  updateCourse(): void {
    // Check form validity, selectedCourseId, userId, and userRole before proceeding
    if (this.courseForm.valid && this.selectedCourseId && this.userId && this.userRole === 'teacher') {
      const updatedCourseData: Omit<Course, 'id'> = {
        title: this.courseForm.value.title,
        description: this.courseForm.value.description,
        teacherId: this.userId // Use number type
      };
      this.courseService.updateCourse(this.selectedCourseId, updatedCourseData).pipe(
        catchError(error => {
          console.error("Error updating course", error);
          this.handleHttpError(error, 'Failed to update course.'); // Handle the error with a specific message
          return throwError(() => new Error(error));
        })
      ).subscribe({
        next: () => {
          this.getCourses(); // Refresh the list after updating
          this.courseForm.reset();
          this.isEditing = false;
          this.selectedCourseId = null;
          this.openSnackBar('הקורס עודכן בהצלחה', 'סגור'); // Show success message
        },
        complete: () => {
          console.log("updateCourse completed");
        }
      });
    } else {
      console.error("Form is invalid, no course selected, user not logged in, or user is not a teacher.");
       if (!this.userId || this.userRole !== 'teacher') {
         this.router.navigate(['/login']); // Redirect if not authorized
      } else {
        this.openSnackBar('אנא בחר קורס לעדכון ומלא את כל השדות הנדרשים.', 'סגור'); // Show validation message
      }
    }
  }

  /**
   * Deletes a course after confirmation.
   * @param id The ID of the course to delete.
   */
  deleteCourse(id: number): void {
     // Check userId and userRole before proceeding
    if (!this.userId || this.userRole !== 'teacher') {
       console.error("User not logged in or user is not a teacher.");
       this.router.navigate(['/login']); // Redirect if not authorized
       return;
    }

    // Open a confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: 'האם אתה בטוח שברצונך למחוק קורס זה?',
        buttonText: {
          ok: 'מחק',
          cancel: 'ביטול'
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // If user confirmed deletion
        this.courseService.deleteCourse(id).pipe(
          catchError(error => {
            console.error("Error deleting course", error);
            this.handleHttpError(error, 'Failed to delete course.'); // Handle the error with a specific message
            return throwError(() => new Error(error));
          })
        ).subscribe({
          next: () => {
            this.getCourses(); // Refresh the list after deleting
            this.openSnackBar('הקורס נמחק בהצלחה', 'סגור'); // Show success message
          },
          complete: () => {
            console.log("deleteCourse completed");
          }
        });
      }
    });
  }

  /**
   * Opens a MatSnackBar with a message.
   * @param message The message to display.
   * @param action The action text for the snackbar button.
   */
  openSnackBar(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 3000, // Duration in milliseconds
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Handles HTTP errors.
   * @param error The HTTP error response.
   * @param defaultMessage A default message to show if no specific error message is available.
   */
  private handleHttpError(error: any, defaultMessage: string = 'An error occurred.'): void {
    if (error.status === 401) {
      // Unauthorized error - redirect to login
      this.openSnackBar('התחברות נדרשת או פג תוקף ההתחברות.', 'סגור');
      this.router.navigate(['/login']);
    } else if (error.error && error.error.message) {
      // Server returned a specific error message
      this.openSnackBar(`שגיאה: ${error.error.message}`, 'סגור');
    } else {
      // Generic error
      this.openSnackBar(defaultMessage, 'סגור');
    }
  }

  // Helper method to check if the current user is the teacher of a course (optional, for template logic)
  isTeacherOfCourse(course: Course): boolean {
      return this.userId !== null && course.teacherId === this.userId;
  }

  // Helper method to check if the current user is a teacher (optional, for template logic)
  isTeacher(): boolean {
      return this.userRole === 'teacher';
  }
}


// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CourseService } from '../course.service';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { Subscription } from 'rxjs';
// import { CommonModule } from '@angular/common';

// interface Course {
//   id: number;
//   title: string;
//   description: string;
//   teacherId: string;
// }

// @Component({
//   selector: 'app-course-management',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterModule],
//   templateUrl: './course-management.component.html',
//   styleUrls: ['./course-management.component.css']
// })
// export class CourseManagementComponent implements OnInit, OnDestroy {
//   courseForm: FormGroup;
//   courses: Course[] = [];
//   isEditing = false;
//   selectedCourseId: number | null = null;
//   private coursesSubscription: Subscription | undefined;
//   userId: number | null; // change userId type

//   constructor(
//     private fb: FormBuilder,
//     private courseService: CourseService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) {
//     this.courseForm = this.fb.group({
//       title: ['', Validators.required],
//       description: ['', Validators.required],
//     });
//     this.userId = Number(sessionStorage.getItem('userId'));
//   }

//   ngOnInit(): void {
//     this.getCourses();
//   }

//   ngOnDestroy(): void {
//     if (this.coursesSubscription) {
//       this.coursesSubscription.unsubscribe();
//     }
//   }

//   getCourses(): void {
//     this.coursesSubscription = this.courseService.getAllCourses().subscribe({
//       next: (courses) => {
//         this.courses = courses;
//       },
//       error: (error) => {
//         console.error("Error fetching courses", error);
//       }
//     });
//   }

//   addCourse(): void {
//     if (this.courseForm.valid && this.userId) { //check if userId exists
//       const courseData: Omit<Course, 'id'> = { 
//         title: this.courseForm.value.title,
//         description: this.courseForm.value.description,
//         teacherId: this.userId.toString()
//       };
//       this.courseService.createCourse(courseData).subscribe({
//         next: () => {
//           this.getCourses();
//           this.courseForm.reset();
//         },
//         error: (error) => {
//           console.error("Error creating course", error);
//         }
//       });
//     }
//         else{
//           console.error("User not logged in")
//         }
//   }

//   selectCourseForEdit(course: Course): void {
//     this.isEditing = true;
//     this.selectedCourseId = course.id;
//     this.courseForm.patchValue({
//       title: course.title,
//       description: course.description,
//     });
//   }

//   updateCourse(): void {
//     if (this.courseForm.valid && this.selectedCourseId && this.userId) { //check if userId exists
//        const updatedCourseData: Omit<Course, 'id'> = {
//         title: this.courseForm.value.title,
//         description: this.courseForm.value.description,
//         teacherId: this.userId.toString()
//       };
//       this.courseService.updateCourse(this.selectedCourseId, updatedCourseData).subscribe(() => {
//         this.getCourses();
//         this.courseForm.reset();
//         this.isEditing = false;
//         this.selectedCourseId = null;
//       });
//     }
//         else{
//           console.error("User not logged in");
//         }
//   }

//   deleteCourse(id: number): void {
//     this.courseService.deleteCourse(id).subscribe(() => {
//       this.getCourses();
//     });
//   }
// }

