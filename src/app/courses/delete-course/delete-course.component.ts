import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-course',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './delete-course.component.html',
  styleUrls: ['./delete-course.component.css']
})
export class DeleteCourseDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteCourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number, title: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
