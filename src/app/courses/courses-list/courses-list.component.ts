// courses-list.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CourseService } from '../course.service';
import { AuthService } from '../../auth/auth.service';
import {  Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // Import RouterModule
// Import Course model
interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: number;
}
@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule to imports
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css']
})
export class CoursesListComponent implements OnInit, OnDestroy {
  courses: Course[] | null = null;
  hasCourses = false;
  isLoading = true;
  private coursesSubscription: Subscription | undefined;
    userId: number | null = null;

  constructor(private courseService: CourseService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.coursesSubscription = this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.hasCourses = courses && courses.length > 0;
        this.isLoading = false;
              this.userId = Number(sessionStorage.getItem('userId'));
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.coursesSubscription) {
      this.coursesSubscription.unsubscribe();
    }
  }
    enroll(courseId: number): void {
    if (this.userId) {
      this.courseService.enrollInCourse(courseId, this.userId).subscribe({
        next: () => {
          console.log(`Successfully enrolled in course ${courseId}`);
          // Refresh the courses list or show a success message
          this.ngOnInit(); // simplest way to refresh
        },
        error: (error) => {
          console.error('Failed to enroll in course:', error);
          // Handle error (e.g., show error message to user)
        },
      });
    } else {
      console.error('User is not logged in.');
      // Redirect to the login page
      //this.router.navigate(['/login']);
    }
  }

  unenroll(courseId: number): void {
    if (this.userId) {
      this.courseService.unenrollFromCourse(courseId, this.userId).subscribe({
        next: () => {
          console.log(`Successfully unenrolled from course ${courseId}`);
          this.ngOnInit();
        },
        error: (error) => {
          console.error('Failed to unenroll from course:', error);
        },
      });
    } else {
       console.error('User is not logged in.');
       this.router.navigate(['/login']);
    }
  }
}
// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { CourseService } from '../course.service';
// import { Observable, Subscription } from 'rxjs';
// import { CommonModule } from '@angular/common';
// import { tap } from 'rxjs/operators';
// import { RouterModule } from '@angular/router';

// interface Course {
//   id: number;
//   title: string;
//   description: string;
//   teacherId: string;
// }

// @Component({
//   selector: 'app-courses-list',
//   standalone: true,
//   imports: [CommonModule, ],
//   templateUrl: './courses-list.component.html',
//   styleUrls: ['./courses-list.component.css']
// })
// export class CoursesListComponent implements OnInit, OnDestroy {
//   courses: Course[] | null = null;
//   hasCourses: boolean = false;
//   isLoading: boolean = true; // הוספת מאפיין מצב טעינה
//   private coursesSubscription: Subscription | undefined;

//   constructor(private courseService: CourseService) { }

//   ngOnInit(): void {
//     this.isLoading = true; // הגדרת מצב טעינה ל-true בתחילת הבקשה
//     this.coursesSubscription = this.courseService.getAllCourses().pipe(
//       tap(courses => {
//         this.hasCourses = courses && courses.length > 0;
//       })
//     ).subscribe({
//       next: courses => {
//         this.courses = courses;
//         this.isLoading = false; // הגדרת מצב טעינה ל-false לאחר קבלת הנתונים
//       },
//       error: error => {
//         console.error('Error loading courses:', error);
//         this.isLoading = false; // הגדרת מצב טעינה ל-false במקרה של שגיאה
//         // כאן אפשר להוסיף טיפול שגיאה מתאים (הצגת הודעה למשתמש)
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     if (this.coursesSubscription) {
//       this.coursesSubscription.unsubscribe();
//     }
//   }
// }
