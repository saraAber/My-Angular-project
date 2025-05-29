import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

// Types
export interface DialogData {
  title: string;
  message: string;
  isError?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.css']
})
export class SuccessDialogComponent {
  emoji: string;
  icon: string;
  isError: boolean;

  constructor(
    public dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    // Set default values
    this.isError = data.isError || false;
    this.icon = data.icon || '';
    
    // Set emoji based on context if no icon is provided
    if (!this.icon) {
      this.emoji = this.determineEmoji(data);
    } else {
      this.emoji = '';
    }
  }

  private determineEmoji(data: DialogData): string {
    // Default emoji
    if (this.isError) return '❌';
    
    // If it's a course registration success
    if (data.message === 'נרשמת בהצלחה לקורס!' ||
        (data.title === 'הצלחה' && data.message.includes('נרשמת'))) {
      return '🤗';
    }
    
    // If it's a course/lesson creation success
    if (data.title === 'הצלחה' && 
        (data.message.includes('הקורס נוצר בהצלחה!') || 
         data.message.includes('השיעור נוצר בהצלחה!'))) {
      return '😃';
    }
    
    // Default success emoji
    return '✅';
  }

  /**
   * Closes the dialog
   */
  onClose(): void {
    this.dialogRef.close();
  }
  
  /**
   * Returns the appropriate CSS class based on the dialog type
   */
  get dialogClass(): string {
    return this.isError ? 'error-dialog' : 'success-dialog';
  }
}
