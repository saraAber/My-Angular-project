import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

// Import required modules
const MATERIAL_MODULES = [
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatSnackBarModule,
  MatChipsModule,
  MatDialogModule,
  MatSpinner
];
import { Subject, Observable, of } from 'rxjs';
import { catchError, finalize, map, takeUntil, tap } from 'rxjs/operators';

import { Course, CourseService, Student } from '../course.service';
import { AuthService } from '../../auth/auth.service';
import { CreateCourseComponent } from '../create-course/create-course.component';
import { EditCourseComponent } from '../edit-course/edit-course.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  template: `
    <!-- Template content will be handled separately -->
  `,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ...MATERIAL_MODULES
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css', './courses-modern-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoursesComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Course data
  filteredCourses: Course[] = [];
  enrolledCourses: Course[] = [];
  allCourses: Course[] = [];
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  
  // UI State
  isLoading = false;
  isEnrolling = false;
  error: string | null = null;
  showAllCourses = true;
  showManageCourses = false; // חדש: ניהול הקורסים שלי
  searchQuery = '';
  
  // User info
  userId: number | null = null;
  userRole: string = '';
  isTeacher = false;
  
  // Track subscriptions for cleanup
  private destroy$ = new Subject<void>();
  
  // Expose Math for template
  Math = Math;
  
  // Track if component is initialized
  private isInitialized = false;
  


  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute
  ) {
    this.userId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();
    this.isTeacher = this.userRole === 'teacher';
  }

  ngOnInit(): void {
    this.initializeComponent();
  }
  
  // Apply filter to courses
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchQuery = filterValue;
    this.currentPage = 0; // Reset to first page
    this.updateFilteredCourses();
    
    // Update URL with search query
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: this.searchQuery || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
  
  // Toggle between all courses and enrolled courses
// מעבר ל'הקורסים שלי'
  // מעבר ל'הקורסים שלי'
  onShowMine(): void {
    this.showAllCourses = false;
    this.showManageCourses = false;
    this.currentPage = 0;
    // שלוף רק את הקורסים אליהם המשתמש רשום והצג אותם
    this.courseService.getCoursesByStudentId(this.userId!).subscribe({
      next: (enrolledCourses) => {
        this.allCourses = [...enrolledCourses];
        this.enrolledCourses = [...enrolledCourses];
        this.updateFilteredCourses();
        this.cdr.markForCheck();
      },
      error: () => {
        this.updateFilteredCourses();
      }
    });
  }

  // מעבר ל'כל הקורסים'
  onShowAll(): void {
    this.showAllCourses = true;
    this.showManageCourses = false;
    this.currentPage = 0;
    // שלוף את כל הקורסים מהשרת והצג אותם
    this.courseService.getCourses(true).subscribe({
      next: (courses) => {
        this.allCourses = [...courses];
        this.updateFilteredCourses();
        this.cdr.markForCheck();
      },
      error: () => {
        this.updateFilteredCourses();
      }
    });
  }

  // מעבר ל'ניהול הקורסים שלי'
  onShowManage(): void {
    this.showAllCourses = false;
    this.showManageCourses = true;
    this.currentPage = 0;
    this.updateFilteredCourses();
  }

  // Update filtered courses based on current filters
  private updateFilteredCourses(): void {
    // אם במצב ניהול, הצג רק קורסים שנוצרו על ידי המורה
    if (this.showManageCourses && this.isTeacher) {
      this.filteredCourses = this.allCourses.filter(course => course.teacherId === this.userId);
      this.totalItems = this.filteredCourses.length;
      this.cdr.markForCheck();
      return;
    }
    let filtered = [...this.allCourses];
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description?.toLowerCase().includes(query) ||
        course.teacherName?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query)
      );
    }
    
    // במצב 'הקורסים שלי' (showAllCourses=false), הצג רק קורסים שהמשתמש רשום אליהם או שהוא המורה שלהם
    // במסך 'הקורסים שלי' – אין צורך בסינון, פשוט מציגים את כל הקורסים שהובאו מהשרת
if (!this.showAllCourses && this.userId) {
  filtered = [...this.allCourses];
}
    // במצב 'כל הקורסים' (showAllCourses=true), הצג את כל הקורסים ללא סינון
    // (אין צורך לסנן, filtered כבר כולל את כל הקורסים)
    
    // Update pagination
    this.totalItems = filtered.length;
    
    // Apply pagination
    const startIndex = this.currentPage * this.pageSize;
    this.filteredCourses = filtered.slice(startIndex, startIndex + this.pageSize);
    
    this.cdr.markForCheck();
  }
  
  // Check if current user is enrolled in a course
  isEnrolled(course: Course): boolean {
    if (!this.userId) return false;
    // בדוק גם את השדה המקומי וגם את רשימת ההרשמות
    return !!course.enrolled || this.enrolledCourses.some(c => c.id === course.id);
  }
  
  // Check if current user is the teacher of a course
  isCourseTeacher(course: Course): boolean {
    return course.teacherId === this.userId;
  }
  
  // שליפת קורסים אליהם המשתמש רשום מהשרת ועדכון סטטוס ההרשמה
  updateEnrolledCourses(): void {
    if (!this.userId) return;
    this.courseService.getCoursesByStudentId(this.userId).subscribe({
      next: (enrolledCourses: Course[]) => {
        const enrolledIds = new Set(enrolledCourses.map(c => c.id));
        this.enrolledCourses = [...enrolledCourses];
        // עדכן דגל enrolled בכל קורס
        this.allCourses.forEach(course => {
          course.enrolled = enrolledIds.has(course.id);
        });
        this.updateFilteredCourses();
        this.cdr.markForCheck();
      },
      error: err => {
        this.enrolledCourses = [];
        this.allCourses.forEach(course => (course.enrolled = false));
        this.updateFilteredCourses();
        this.cdr.markForCheck();
      }
    });
  }
  
  // Open create course dialog
  openCreateCourseDialog(): void {
    const dialogRef = this.dialog.open(CreateCourseComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCourses(true);
      }
    });
  }
  
  // הרשמה/יציאה מקורס (תמיד מרענן מהשרת!)
  enrollOrUnenroll(course: Course): void {
    if (!this.userId) {
      this.showError('יש להתחבר למערכת לפני ההרשמה לקורס');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.isEnrolling) return;
    this.isEnrolling = true;
    this.cdr.markForCheck();

    // אם כבר רשום - בצע יציאה
    if (this.isEnrolled(course)) {
      this.courseService.unenrollStudent(course.id, this.userId)
        .pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.showSuccess('יצאת מהקורס בהצלחה!');
            this.updateEnrolledCourses(); // רענון מהשרת בלבד
          }),
          catchError((error: any) => {
            // אם שגיאת 404 או 500 - נניח שהמשתמש כבר לא רשום
            if (error && (error.status === 404 || error.status === 500)) {
              this.showSuccess('ייתכן שכבר אינך רשום לקורס זה, או שיש בעיה זמנית. הכפתור עודכן להרשמה.');
              course.enrolled = false;
              this.enrolledCourses = this.enrolledCourses.filter(c => c.id !== course.id);
              this.updateEnrolledCourses();
              this.updateFilteredCourses();
              this.cdr.markForCheck();
            } else {
              console.error('Failed to unenroll from course:', error);
              const errorMessage = error.message || 'שגיאה ביציאה מהקורס. נסה שוב מאוחר יותר.';
              this.showError(errorMessage);
            }
            return of(null);
          }),
          finalize(() => {
            this.isEnrolling = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe();
    } else {
      // אחרת - בצע הרשמה
      this.courseService.enrollInCourse(course.id, this.userId)
        .pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.showSuccess('נרשמת בהצלחה לקורס!');
            this.updateEnrolledCourses(); // רענון מהשרת בלבד
          }),
          catchError((error: any) => {
            // בדיקת שגיאת הרשמה כפולה
            // כל שגיאת 500 בהרשמה תיחשב כהצלחה (המשתמש כבר רשום)
            if (error && error.status === 500) {
              this.showSuccess('ייתכן שכבר נרשמת לקורס זה, או שיש בעיה זמנית. הכפתור עודכן ליציאה מהקורס.');
              course.enrolled = true;
              if (!this.enrolledCourses.some(c => c.id === course.id)) {
                this.enrolledCourses.push(course);
              }
              this.updateEnrolledCourses();
              this.updateFilteredCourses();
              this.cdr.markForCheck();
            } else {
              console.error('Failed to enroll in course:', error);
              const errorMessage = error.message || 'שגיאה בהרשמה לקורס. נסה שוב מאוחר יותר.';
              this.showError(errorMessage);
            }
            return of(null);
          }),
          finalize(() => {
            this.isEnrolling = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe();
    }
  }
  
  private initializeComponent(): void {
    this.activatedRoute.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      if (params['view']) {
        this.showAllCourses = params['view'] === 'all';
      } else {
        // ברירת מחדל: הצג את כל הקורסים
        this.showAllCourses = true;
      }
      
      if (!this.isInitialized) {
        this.loadCourses();
        this.isInitialized = true;
      } else {
        this.updateFilteredCourses();
      }
    });
  }
  
  ngAfterViewInit(): void {
    // Set up paginator after view init
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updateFilteredCourses();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isLoggedInUser(): boolean {
    return this.authService.isLoggedIn();
  }
  
  get userIdValue(): number {
    return this.userId || 0;
  }

  loadCourses(forceRefresh = false): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();
    
    this.courseService.getCourses(forceRefresh)
      .pipe(
        takeUntil(this.destroy$),
        map(courses => 
          courses.map(course => ({
            ...course,
            name: course.title, // Backward compatibility
            teacherName: course.teacherName,
            
            startDate: course.startDate ? new Date(course.startDate) : new Date(),
            students: course.students || [],
            // Add default values for new properties
            progress: course.progress || 0,
            rating: course.rating || 0,
            price: course.price || 0,
            duration: course.duration || 0,
            isNew: course.isNew || false,
            category: course.category || 'כללי'
          }))
        ),
        tap(courses => {
          this.allCourses = [...courses];
          this.updateFilteredCourses();
          this.updateEnrolledCourses();
        }),
        catchError((error: Error) => {
          console.error('Failed to load courses:', error);
          this.error = error.message || 'שגיאה בטעינת הקורסים. נסה שנית מאוחר יותר.';
          this.showError(this.error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe();
  }
  
  // Mark new courses (added in the last 7 days)
  private markNewCourses(): void {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    this.allCourses = this.allCourses.map(course => {
      const createdAt = course.createdAt ? new Date(course.createdAt) : null;
      return {
        ...course,
        isNew: !!createdAt && createdAt > oneWeekAgo
      };
    });
    
    this.updateFilteredCourses();
  }

  // Show success message
  public showSuccess(message: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'הצלחה',
        message: message,
        confirmText: 'סגור',
        cancelText: '',
        confirmColor: 'primary'
      },
      panelClass: 'centered-dialog',
      disableClose: false
    });
  }

  // Show error message
  public showError(message: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'שגיאה',
        message: message,
        confirmText: 'סגור',
        cancelText: '',
        confirmColor: 'warn'
      },
      panelClass: 'centered-dialog',
      disableClose: false
    });
  }
  
  // Apply course filters based on current view and search
  applyCourseFilter(): void {
    if (this.showAllCourses) {
      this.filteredCourses = [...this.courses];
    } else {
      this.filteredCourses = this.enrolledCourses.length > 0 
        ? [...this.enrolledCourses] 
        : [];
    }
    this.totalItems = this.filteredCourses.length;
    this.currentPage = 0; // Reset to first page when filter changes
  }

  // Track by function for ngFor
  trackByCourseId(index: number, course: Course): number {
    return course.id;
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateFilteredCourses();
  }
  
  navigateToCreateCourse(): void {
    this.router.navigate(['/courses/new']);
  }
  
  enrollInCourse(courseId: number, userId: number): void {
  if (!this.userId) {
    this.showError('יש להתחבר למערכת לפני ההרשמה לקורס');
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    return;
  }

  this.isEnrolling = true;
  this.cdr.markForCheck();

  this.courseService.enrollInCourse(courseId, userId)
    .pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.showSuccess('נרשמת בהצלחה לקורס!');
        this.courseService.deleteCourse(courseId)
          .pipe(
            takeUntil(this.destroy$),
            tap(() => {
              this.allCourses = this.allCourses.filter(c => c.id !== courseId);
              this.updateFilteredCourses();
            }),
            catchError((error: Error) => {
              console.error('Failed to delete course:', error);
              const errorMessage = error.message || 'שגיאה במחיקת הקורס. נסה שוב מאוחר יותר.';
              this.showError(errorMessage);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.cdr.markForCheck();
            })
          )
          .subscribe();
      })
    )
    .subscribe();
  }

  // פתיחת דיאלוג עריכת קורס
  editCourse(course: Course): void {
    const dialogRef = this.dialog.open(EditCourseComponent, {
      width: '420px',
      data: {
        id: course.id,
        title: course.title,
        description: course.description
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadCourses();
      }
    });
  }

  // מחיקת קורס (עבור כפתור המחיקה בתבנית)
  deleteCourse(courseId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'מחיקת קורס',
        message: 'האם אתה בטוח שברצונך למחוק את הקורס?',
        confirmText: 'מחק',
        cancelText: 'ביטול',
        confirmColor: 'warn'
      },
      disableClose: false
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.courseService.deleteCourse(courseId).subscribe({
          next: () => {
            this.showSuccess('הקורס נמחק בהצלחה');
            this.allCourses = this.allCourses.filter((c: any) => c.id !== courseId);
            this.updateFilteredCourses();
          },
          error: (error: any) => {
            this.showError(error.message || 'שגיאה במחיקת הקורס. נסה שוב מאוחר יותר.');
          }
        });
      }
    });
  }
}
