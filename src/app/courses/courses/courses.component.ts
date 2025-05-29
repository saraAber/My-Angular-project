import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
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
import { ConfirmDialogComponent, TruncatePipe } from '../../shared';

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
    ...MATERIAL_MODULES,
    MatChipListbox,
    MatChipOption,
    TruncatePipe
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
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
  showAllCourses = false;
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
  
  // Track enrollment state
  isEnrolling = false;
  
  // Expose Math object to template
  Math = Math;
  
  // Initialize pagination
  pageSize = 10;
  currentPage = 0;
  totalItems = 0;

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
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
  toggleCoursesView(): void {
    this.showAllCourses = !this.showAllCourses;
    this.currentPage = 0; // Reset to first page
    this.updateFilteredCourses();
  }
  
  // Update filtered courses based on current filters
  private updateFilteredCourses(): void {
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
    
    // Apply enrolled filter
    if (!this.showAllCourses && this.userId) {
      filtered = filtered.filter(course => 
        this.isEnrolled(course) || this.isCourseTeacher(course)
      );
    }
    
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
    return this.enrolledCourses.some(c => c.id === course.id);
  }
  
  // Check if current user is the teacher of a course
  isCourseTeacher(course: Course): boolean {
    return course.teacherId === this.userId;
  }
  
  // Update enrolled courses list
  updateEnrolledCourses(): void {
    if (!this.userId) return;
    
    this.enrolledCourses = this.courses.filter(course => 
      course.students?.some((student: Student | number) => {
        if (typeof student === 'number') {
          return student === this.userId;
        }
        return student.id === this.userId;
      })
    );
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
  
  // Enroll in a course
  enroll(courseId: number): void {
    if (this.isEnrolling) return;
    
    this.isEnrolling = true;
    this.courseService.enrollInCourse(courseId).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isEnrolling = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.showSuccess('ההרשמה בוצעה בהצלחה!');
        this.loadCourses(true);
      },
      error: (error) => {
        console.error('Failed to enroll in course', error);
        this.showError('אירעה שגיאה בהרשמה לקורס');
      }
    });
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
            teacherName: course.teacherName || 'ללא מורה',
            enrolledStudents: course.enrolledStudents || 0,
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
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'סגור', { duration: 3000 });
  }

  // Show error message
  private showError(message: string): void {
    this.snackBar.open(message, 'סגור', { duration: 5000, panelClass: ['error-snackbar'] });
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
  
  enrollInCourse(courseId: number): void {
    if (!this.userId) {
      this.showError('יש להתחבר למערכת לפני ההרשמה לקורס');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    this.isEnrolling = true;
    this.cdr.markForCheck();
    
    this.courseService.enrollInCourse(courseId, this.userId)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.showSuccess('נרשמת בהצלחה לקורס!');
          // Update local state without full reload for better UX
          const course = this.allCourses.find(c => c.id === courseId);
          if (course) {
            course.enrolled = true;
            course.enrolledStudents = (course.enrolledStudents || 0) + 1;
            this.updateFilteredCourses();
          }
        }),
        catchError((error: Error) => {
          console.error('Failed to enroll in course:', error);
          const errorMessage = error.message || 'שגיאה בהרשמה לקורס. נסה שוב מאוחר יותר.';
          this.showError(errorMessage);
          return of(null);
        }),
        finalize(() => {
          this.isEnrolling = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe();
  }

  deleteCourse(courseId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'מחיקת קורס',
        message: 'האם אתה בטוח שברצונך למחוק קורס זה? פעולה זו לא ניתנת לביטול.',
        confirmText: 'מחק',
        cancelText: 'ביטול',
        isError: true
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.isLoading = true;
          this.cdr.markForCheck();
          
          this.courseService.deleteCourse(courseId)
            .pipe(
              takeUntil(this.destroy$),
              tap(() => {
                this.showSuccess('הקורס נמחק בהצלחה');
                // Remove from local state for immediate feedback
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
        }
      });
  }

  enroll(courseId: number): void {
    if (!this.userId) {
      console.error('User not logged in');
      return;
    }
    
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.courseService.enrollInCourse(courseId, this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadCourses();
        },
        error: (err: any) => {
          console.error('Failed to enroll in course:', err);
          this.error = 'שגיאה בהרשמה לקורס. נסה שוב מאוחר יותר.';
          this.isLoading = false;
        }
      });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'סגור', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
      direction: 'rtl'
    });
  }
  
  private showError(message: string): void {
    this.snackBar.open(message, 'סגור', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
      direction: 'rtl'
    });
  }
  
  trackByCourseId(index: number, course: Course): number {
    return course.id;
  }
}
