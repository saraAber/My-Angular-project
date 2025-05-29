import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-lesson-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-lesson-dialog.component.html',
  styleUrls: ['./add-lesson-dialog.component.css']
})
export class AddLessonDialogComponent {
  title: string = '';
  content: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddLessonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    if (!this.title || !this.content) {
      return;
    }
    this.dialogRef.close({ title: this.title, content: this.content });
  }

}
