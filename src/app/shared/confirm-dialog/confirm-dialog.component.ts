import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'אישור פעולה' }}</h2>
    <mat-dialog-content>
      <p>{{ data.message || 'האם אתה בטוח שברצונך לבצע פעולה זו?' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        {{ data.cancelText || 'ביטול' }}
      </button>
      <button 
        mat-raised-button 
        [color]="data.confirmColor || 'primary'"
        [mat-dialog-close]="true"
        cdkFocusInitial>
        {{ data.confirmText || 'אישור' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      direction: rtl;
      width: 100%;
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }
    
    mat-dialog-content {
      padding: 0 24px;
      margin: 16px 0;
    }
    
    button {
      margin-right: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title?: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      confirmColor?: string;
    }
  ) {}
}
