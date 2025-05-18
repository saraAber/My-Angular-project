import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router,RouterModule } from '@angular/router';
import { CourseService } from '../courses/course.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './enrollment.component.html',
  styleUrls: ['./enrollment.component.css']
})
export class EnrollmentComponent implements OnInit {
  courseId: number;
  userId: number | null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) {
    this.courseId = Number(this.route.snapshot.params['courseId']);
    this.userId =  Number(sessionStorage.getItem('userId'));
  }

  ngOnInit() {
    if (!this.userId) {
      this.router.navigate(['/login']);
    }
  }

  onEnroll() {
    if (this.userId !== null) {
      this.courseService.enrollInCourse(this.courseId, this.userId)
        .subscribe({
          next: () => {
            alert('נרשמת לקורס בהצלחה!');
            this.router.navigate(['/courses', this.courseId]);
          },
          error: (err:any) => {
            console.error('Error enrolling', err);
            // Handle error: Show message to user
          }
        });
    } else {
      console.error("user is not logged in");
      this.router.navigate(['/login']);
    }
  }

  onCancel() {
    this.router.navigate(['/courses', this.courseId]);
  }
}

// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { CourseService } from '../courses/course.service';
// import { AuthService } from '../auth/auth.service';

// @Component({
//   selector: 'app-enrollment',
//   standalone: true,
//   imports: [ RouterModule, ],
//   templateUrl: './enrollment.component.html',
//   styleUrls: ['./enrollment.component.css']
// })
// export class EnrollmentComponent implements OnInit {
//   courseId: number;
//   userId: number | null;
//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private courseService: CourseService,
//     private authService: AuthService
//   ) {
//     this.courseId = Number(this.route.snapshot.params['courseId']);
//     this.userId =  Number(sessionStorage.getItem('userId'));
//   }

//   ngOnInit() {
//     this.authService.getToken()
//     if (!this.userId) {
//       this.router.navigate(['/login']);
//     }
//   }

//   onEnroll() {
//     if (this.userId !== null) {
//       this.courseService.enrollInCourse(this.courseId, this.userId)
//         .subscribe({
//           next: () => {
//             console.log('Enrolled successfully');
//             this.router.navigate(['/courses', this.courseId]);
//           },
//           error: (err) => {
//             console.error('Error enrolling', err);
//             // Handle error: Show message to user
//           }
//         });
//     } else {
//       console.error("user is not logged in");
//       this.router.navigate(['/login']);
//     }
//   }

//   onCancel() {
//     this.router.navigate(['/courses', this.courseId]);
//   }
// }
