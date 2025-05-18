import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../course.service';
// Import Course model
interface Course {
  id: number;
  title: string;
  description: string;
  teacherId: string;
}
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  course: Course | undefined;
  private routeSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
        private router: Router
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const courseId = Number(params['id']);
      if (!isNaN(courseId)) {
        this.loadCourseDetails(courseId);
      } else {
        console.error('Invalid course ID in route:', params['id']);
        this.router.navigate(['/courses']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadCourseDetails(id: number): void {
    this.courseService.getCourseById(id).subscribe({
      next: (course: Course) => { // Specify the type of course
        this.course = course;
      },
      error: (error: any) => {  // Specify the type of error
        console.error('Error loading course details:', error);
        this.router.navigate(['/courses']);
      }
    });
  }
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
