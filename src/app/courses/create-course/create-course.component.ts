import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup, 
  FormControl, 
  Validators, 
  FormsModule 
} from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';

// Services
import { CourseService } from '../course.service';

// Components
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

import { Course } from '../course.service';

// Types
interface CourseForm {
  title: string;
  description: string;
}

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent {
  // Form state
  courseForm: FormGroup<{
    title: FormControl<string | null>;
    description: FormControl<string | null>;
  }>;
  
  // UI state
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  // Events
  @Output() courseCreated = new EventEmitter<Course>();

  // Services
  private readonly fb = inject(FormBuilder);
  private readonly courseService = inject(CourseService);
  private readonly dialogRef = inject(MatDialogRef<CreateCourseComponent>);
  private readonly dialog = inject(MatDialog);

  constructor() {
    this.courseForm = this.fb.group({
      title: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]]
    });
  }

  /**
   * סגירת הדיאלוג
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * שליחת טופס יצירת קורס
   */
  createCourse(): void {
    if (this.courseForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.setLoadingState(true);
    
    const formValue = this.courseForm.value as CourseForm;
    
    this.courseService.createCourse(formValue.title!, formValue.description!)
      .subscribe({
        next: (course: Course) => {
          console.log('Course created successfully:', course);
          this.handleCreateSuccess(course);
        },
        error: (error) => {
          console.error('Error creating course:', error);
          this.handleCreateError(error);
        }
      });
  }

  /**
   * טיפול בהצלחת יצירת הקורס
   */
  private handleCreateSuccess(course: Course): void {
    this.setLoadingState(false);
    this.courseCreated.emit(course);
    this.showSuccessDialog();
    this.dialogRef.close(true);
  }

  /**
   * טיפול בשגיאה ביצירת הקורס
   */
  private handleCreateError(error: any): void {
    console.error('[CreateCourse] Error:', error);
    this.errorMsg = error.error?.message || 'אירעה שגיאה ביצירת הקורס. נסה שוב מאוחר יותר.';
    this.setLoadingState(false);
    
    // Show error in dialog if needed
    this.dialog.open(SuccessDialogComponent, {
      width: '320px',
      data: {
        title: 'שגיאה',
        message: this.errorMsg,
        isError: true
      }
    });
  }

  /**
   * הצגת הודעת הצלחה
   */
  private showSuccessDialog(): void {
    this.dialog.open(SuccessDialogComponent, {
      width: '320px',
      disableClose: true,
      data: {
        title: 'הצלחה!',
        message: 'הקורס נוצר בהצלחה! 😃',
        icon: 'check_circle'
      }
    });
  }

  /**
   * סימון כל השדות כנגועים (לצורך הצגת הודעות שגיאה)
   */
  private markAllAsTouched(): void {
    Object.values(this.courseForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  /**
   * עדכון מצב הטעינה
   */
  private setLoadingState(isLoading: boolean): void {
    this.isLoading = isLoading;
    
    if (isLoading) {
      this.errorMsg = '';
      this.successMsg = '';
      this.courseForm.disable();
    } else {
      this.courseForm.enable();
    }
  }
}
