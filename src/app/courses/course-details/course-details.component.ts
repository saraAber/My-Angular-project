// Angular core
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Routing
import { ActivatedRoute, RouterModule, Router } from '@angular/router';

// Services
import { CourseService, Course } from '../course.service';
import { LessonService } from '../lesson.service';
import { AuthService } from '../../auth/auth.service';

// Models
import { Lesson } from '../lesson.model';

// Components
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';
import { AddLessonDialogComponent } from '../add-lesson-dialog/add-lesson-dialog.component';
import { DeleteCourseDialogComponent } from '../delete-course/delete-course.component';
import { DeleteLessonDialogComponent } from '../delete-lesson/delete-lesson.component';
import { EditLessonComponent } from '../edit-lesson/edit-lesson.component';

type UserRole = 'student' | 'teacher' | '';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    // Angular modules
    CommonModule,
    RouterModule,
    
    // Material modules
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    
    // Dialogs (used in component methods)
    // Removed unused dialog/component imports to resolve lint warnings
  ],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
  isEnrolled = false;
  courseId!: number;
  course: Course | null = null;
  lessons: Lesson[] = [];
  hasLessons = false;
  userRole: UserRole = '';
  isCourseOwner = false;

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private lessonService: LessonService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}


  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Set user role safely
    const role = this.authService.getUserRole();
    if (role === 'student' || role === 'teacher') {
      this.userRole = role;
    } else {
      this.userRole = '';
    }
    console.log("User role:", this.userRole);

    this.loadCourseDetails();
  }

  loadCourseDetails() {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (data: Course) => {
        this.course = data;
        const myId = this.authService.getUserId();
        // בדיקה אמיתית: האם המשתמש מופיע במערך הסטודנטים של הקורס
        if (Array.isArray(data.students)) {
          this.isEnrolled = data.students.some((student: any) => {
            if (typeof student === 'object' && student !== null) {
              return student.id === myId;
            }
            return student === myId;
          });
        } else {
          // fallback: השתמש בדגל enrolled אם קיים
          this.isEnrolled = !!data.enrolled;
        }
        
        this.isCourseOwner = this.userRole === 'teacher' && 
                           data.teacherId !== undefined && 
                           myId !== null &&
                           data.teacherId === myId;
        this.loadLessons();
        console.log("Course ID:", this.courseId);
      },
      error: (err) => console.error("Error loading course:", err),
      complete: () => this.isLoading = false
    });
  }

  loadLessons() {
    this.lessonService.getLessonsByCourseId(this.courseId).subscribe({
      next: (data) => {
        this.lessons = data;
        this.hasLessons = Array.isArray(data) && data.length > 0;
        console.log("[loadLessons] lessons:", this.lessons);
      },
      error: (err) => {
        this.hasLessons = false;
        console.error("Error loading lessons:", err)
      }
    });
  }

  enrollCourse() {
    if (!this.hasLessons) {
      this.dialog.open(SuccessDialogComponent, {
        width: '300px',
        data: {
          title: 'אין אפשרות להירשם',
          message: 'לא ניתן להירשם לקורס זה כי אין בו שיעורים.'
        }
      });
      return;
    }
    if (this.isEnrolled) {
      console.warn('[הרשמה] ניסיון הרשמה כפול – המשתמש כבר רשום לקורס', this.courseId);
      this.dialog.open(SuccessDialogComponent, {
        width: '300px',
        data: {
          title: 'הודעה',
          message: 'את/ה כבר רשום/ה לקורס.'
        }
      });
      return;
    }
    console.log('[הרשמה] מנסה להירשם לקורס', this.courseId);
    const userId = this.authService.getUserId();
    this.courseService.enrollInCourse(this.courseId, userId).subscribe({
      next: () => {
        this.loadCourseDetails(); // ריענון מהשרת!
        this.dialog.open(SuccessDialogComponent, {
          width: '300px',
          data: {
            title: 'הצלחה',
            message: 'נרשמת בהצלחה לקורס!'
          }
        });
      },
      error: (err) => {
        const errMsg = err?.error?.message || err?.error || '';
        if ((err?.error?.code === 'SQLITE_CONSTRAINT') ||
            (typeof errMsg === 'string' && (errMsg.includes('SQLITE_CONSTRAINT') || errMsg.includes('כבר רשום')))) {
          this.isEnrolled = true; // ודא שכפתור יציאה יוצג מיד
          this.dialog.open(SuccessDialogComponent, {
            width: '300px',
            data: {
              title: 'הודעה',
              message: 'את/ה כבר רשום/ה לקורס.'
            }
          });
          return;
        }
        if (err.status === 500) {
          this.isEnrolled = true; // ודא שכפתור יציאה יוצג מיד
          this.dialog.open(SuccessDialogComponent, {
            width: '300px',
            data: {
              title: 'שגיאה',
              message: 'לא ניתן להירשם לקורס. ייתכן שכבר נרשמת או שיש בעיה זמנית. נסה שוב מאוחר יותר.'
            }
          });
          return;
        }
        this.dialog.open(SuccessDialogComponent, {
          width: '300px',
          data: {
            title: 'שגיאה',
            message: 'אירעה שגיאה בהרשמה לקורס.'
          }
        });
      }
    });
  }

  leaveCourse() {
    if (!this.isEnrolled) {
      console.warn('[יציאה] ניסיון יציאה – המשתמש לא רשום לקורס', this.courseId);
      this.dialog.open(SuccessDialogComponent, {
        width: '300px',
        data: {
          title: 'הודעה',
          message: 'את/ה לא רשום/ה לקורס.'
        }
      });
      return;
    }
    console.log('[יציאה] מנסה לצאת מהקורס', this.courseId);
    const userId = this.authService.getUserId();
    if (userId === null) {
      this.dialog.open(SuccessDialogComponent, {
        width: '300px',
        data: {
          title: 'שגיאה',
          message: 'יש להתחבר למערכת לפני ביטול הרשמה'
        }
      });
      return;
    }
    this.courseService.unenrollStudent(this.courseId, userId).subscribe({
      next: () => {
        this.loadCourseDetails(); // ריענון מהשרת!
        this.dialog.open(SuccessDialogComponent, {
          width: '300px',
          data: {
            title: 'הצלחה',
            message: 'יצאת מהקורס בהצלחה.'
          }
        });
      },
      error: (err) => {
        console.error('[יציאה] שגיאה ביציאה מהקורס', this.courseId, err);
        this.dialog.open(SuccessDialogComponent, {
          width: '300px',
          data: {
            title: 'שגיאה',
            message: 'אירעה שגיאה ביציאה מהקורס.'
          }
        });
      }
    });
  }
  
  addLesson() {
    if (!this.isCourseOwner) {
      this.dialog.open(SuccessDialogComponent, {
        width: '340px',
        data: {
          title: 'אין הרשאה',
          message: 'רק יוצר הקורס יכול להוסיף שיעורים.'
        }
      });
      return;
    }
    const dialogRef = this.dialog.open(AddLessonDialogComponent, {
      width: '400px',
      data: { courseId: this.courseId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lessonService.createLesson(this.courseId, result.title, result.content).subscribe({
          next: () => {
            this.loadLessons();
            this.dialog.open(SuccessDialogComponent, {
              width: '320px',
              data: {
                title: 'הצלחה',
                message: 'השיעור נוצר בהצלחה! 😃'
              }
            });
            console.log("Lessons after adding new lesson:", this.lessons);
          },
          error: (err) => console.error("Error adding lesson:", err)
        });
      }
    });
  }
  
  deleteLesson(lessonId: number) {
    if (!this.isCourseOwner) {
      this.dialog.open(SuccessDialogComponent, {
        width: '340px',
        data: {
          title: 'אין הרשאה',
          message: 'רק יוצר הקורס יכול למחוק שיעורים.'
        }
      });
      return;
    }
    const lesson = this.lessons.find(l => l.id === lessonId);
    const lessonTitle = lesson ? lesson.title : lessonId;
    const dialogRef = this.dialog.open(DeleteLessonDialogComponent, {
      width: '350px',
      data: { id: lessonId, title: lessonTitle }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lessonService.deleteLesson(this.courseId, lessonId).subscribe({
          next: () => {
            this.dialog.open(SuccessDialogComponent, {
              width: '300px',
              data: {
                title: 'הצלחה',
                message: 'מחיקת השיעור בוצעה בהצלחה!'
              }
            });
            this.loadLessons();
          },
          error: (err) => {
            this.dialog.open(SuccessDialogComponent, {
              width: '300px',
              data: {
                title: 'שגיאה',
                message: 'אירעה שגיאה במחיקת השיעור'
              }
            });
            console.error("Error deleting lesson:", err);
          }
        });
      }
    });
  }

  editLesson(lesson: any) {
    if (!this.isCourseOwner) {
      this.dialog.open(SuccessDialogComponent, {
        width: '340px',
        data: {
          title: 'אין הרשאה',
          message: 'רק יוצר הקורס יכול לערוך שיעורים.'
        }
      });
      return;
    }
    const dialogRef = this.dialog.open(EditLessonComponent, {
      width: '400px',
      data: {
        courseId: this.courseId,
        lessonId: lesson.id,
        title: lesson.title,
        content: lesson.content
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadLessons();
      }
    });
  }

  deleteCourse() {
    if (!this.isCourseOwner) {
      this.dialog.open(SuccessDialogComponent, {
        width: '340px',
        data: {
          title: 'אין הרשאה',
          message: 'רק יוצר הקורס יכול למחוק את הקורס.'
        }
      });
      return;
    }
    const dialogRef = this.dialog.open(DeleteCourseDialogComponent, {
      width: '350px',
      data: { id: this.courseId, title: this.course?.title || this.courseId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.courseService.deleteCourse(this.courseId).subscribe({
          next: () => {
            this.dialog.open(SuccessDialogComponent, {
              width: '300px',
              data: {
                title: 'הצלחה',
                message: 'הקורס נמחק בהצלחה!'
              }
            });
            this.router.navigate(['/courses']);
          },
          error: (err) => {
            this.dialog.open(SuccessDialogComponent, {
              width: '300px',
              data: {
                title: 'שגיאה',
                message: 'אירעה שגיאה במחיקת הקורס'
              }
            });
            console.error('Error deleting course:', err);
          }
        });
      }
    });
  }

}