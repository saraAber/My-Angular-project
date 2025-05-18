import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

// Define the interface for the data passed to the dialog
export interface ConfirmationDialogData {
  message: string;
  buttonText: {
    ok: string;
    cancel: string;
  };
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog-component.component.html',
  styleUrls: ['./confirmation-dialog-component.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, // Import MatDialogModule for the dialog itself
    MatButtonModule  // Import MatButtonModule for the buttons
  ]
})
export class ConfirmationDialogComponent {

  constructor(
    // Inject MatDialogRef to close the dialog and pass data back
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    // Inject the data passed to the dialog
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  /**
   * Called when the user clicks the OK button.
   * Closes the dialog and returns true.
   */
  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  /**
   * Called when the user clicks the Cancel button or closes the dialog.
   * Closes the dialog and returns false.
   */
  onCancelClick(): void {
    this.dialogRef.close(false);
  }
}
