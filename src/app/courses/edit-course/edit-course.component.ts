import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CourseService } from '../course.service';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent {
  @Output() courseUpdated = new EventEmitter<void>();
  courseForm: FormGroup;
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private dialogRef: MatDialogRef<EditCourseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number, title: string, description: string },
    private authService: AuthService
  ) {
    this.courseForm = this.fb.group({
      title: [data.title, [Validators.required, Validators.minLength(3)]],
      description: [data.description, [Validators.required, Validators.minLength(10)]]
    });
  }

  updateCourse() {
    if (this.courseForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';
    const { title, description } = this.courseForm.value;
    const teacherId = this.authService.getUserId();
    if (teacherId == null) {
      this.errorMsg = 'לא ניתן לעדכן קורס ללא זיהוי מורה';
      this.isLoading = false;
      return;
    }
    this.courseService.updateCourse(this.data.id, title, description, teacherId).subscribe({
      next: (res: any) => {
        this.successMsg = 'הקורס עודכן בהצלחה!';
        this.isLoading = false;
        this.courseUpdated.emit();
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.errorMsg = 'אירעה שגיאה בעדכון הקורס';
        this.isLoading = false;
        console.error('[עדכון קורס] שגיאה:', err);
      }
    });
  }
}
