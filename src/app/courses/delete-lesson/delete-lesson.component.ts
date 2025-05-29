import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-lesson',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './delete-lesson.component.html',
  styleUrls: ['./delete-lesson.component.css']

})
export class DeleteLessonDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteLessonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number, title: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
