import { Component, Inject, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LessonService } from '../lesson.service';
import { AutoResizeDirective } from '../../shared/directives/auto-resize.directive';

@Component({
  selector: 'app-edit-lesson',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,

  ],
  templateUrl: './edit-lesson.component.html',
  styleUrls: ['./edit-lesson.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditLessonComponent {
  @Output() lessonUpdated = new EventEmitter<void>();
  lessonForm: FormGroup;
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private lessonService: LessonService,
    public dialogRef: MatDialogRef<EditLessonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { courseId: number, lessonId: number, title: string, content: string }
  ) {
    this.lessonForm = this.fb.group({
      title: [data.title, [Validators.required, Validators.minLength(3)]],
      content: [data.content, [Validators.required, Validators.minLength(10)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }


  updateLesson() {
    if (this.lessonForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';
    const { title, content } = this.lessonForm.value;
    this.lessonService.updateLesson(this.data.courseId, this.data.lessonId, { title, content, courseId: this.data.courseId }).subscribe({
      next: () => {
        this.successMsg = 'השיעור עודכן בהצלחה!';
        this.isLoading = false;
        this.lessonUpdated.emit();
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.errorMsg = 'אירעה שגיאה בעדכון השיעור';
        this.isLoading = false;
        console.error('[עדכון שיעור] שגיאה:', err);
      }
    });
  }
}
