import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CourseService } from '../course.service';
import { AuthService } from '../../auth/auth.service';
import { EditCourseComponent } from '../edit-course/edit-course.component';

@Component({
  selector: 'app-courses-list-editable',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, EditCourseComponent],
  templateUrl: './courses-list-editable.component.html',
  styleUrls: ['./courses-list-editable.component.css']
})
export class CoursesListEditableComponent implements OnInit {
  courses: any[] = [];
  myCourses: any[] = [];
  myTeacherId: number | null = null;
  isLoading = false;
  errorMsg = '';

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.myTeacherId = this.authService.getUserId();
    this.courseService.getCourses().subscribe({
      next: (courses: any[]) => {
        this.courses = courses;
        this.myCourses = courses.filter(c => c.teacherId === this.myTeacherId);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'שגיאה בטעינת הקורסים';
        this.isLoading = false;
      }
    });
  }

  openEditDialog(course: any) {
    const dialogRef = this.dialog.open(EditCourseComponent, {
      width: '400px',
      data: {
        id: course.id,
        title: course.title,
        description: course.description
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshCourses();
      }
    });
  }

  refreshCourses() {
    this.isLoading = true;
    this.courseService.getCourses().subscribe({
      next: (courses: any[]) => {
        this.courses = courses;
        this.myCourses = courses.filter(c => c.teacherId === this.myTeacherId);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'שגיאה ברענון הקורסים';
        this.isLoading = false;
      }
    });
  }
}
