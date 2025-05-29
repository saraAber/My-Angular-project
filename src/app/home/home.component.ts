import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourseService } from '../courses/course.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth/auth.service';
import { SuccessDialogComponent } from '../courses/success-dialog/success-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, SuccessDialogComponent]
})
export class HomeComponent implements OnInit {
  courses: any[] = [];
  popularCourses: any[] = [];

  constructor(
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.pickRandomPopularCourses();
      },
      error: (err) => {
        this.courses = [];
        this.popularCourses = [];
      }
    });
  }

  pickRandomPopularCourses() {
    if (!this.courses || this.courses.length === 0) {
      this.popularCourses = [];
      return;
    }
    // Shuffle and pick 3
    const shuffled = this.courses.sort(() => 0.5 - Math.random());
    this.popularCourses = shuffled.slice(0, 3);
  }

  goToCourses() {
    if (!this.authService.isLoggedIn()) {
      this.dialog.open(SuccessDialogComponent, {
        width: '340px',
        data: {
          title: 'נדרש להתחבר',
          message: `
כדי לצפות בכל הקורסים יש להתחבר למערכת.<br><br>
<a href="auth" onclick="window.navigateToLoginFromDialog && window.navigateToLoginFromDialog(event)" style="color:#1976d2;text-decoration:underline;font-weight:bold;">מעבר למסך התחברות</a>` ,
          isError: true,
          icon: 'lock'
        }
      });
      // הפוך את הפונקציה זמינה ל-window כדי שהקישור בדיאלוג יעבוד
      (window as any).navigateToLoginFromDialog = (event: Event) => {
        event.preventDefault();
        this.dialog.closeAll();
        this.router.navigate(['/auth']);
      };
      return;
    }
    this.router.navigate(['/courses']);
  }
}
