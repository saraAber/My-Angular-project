import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../courses/success-dialog/success-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  profileForm: FormGroup;
  isLoading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: [''],
      role: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
          role: profile.role
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'שגיאה בטעינת הפרופיל';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    this.isLoading = true;
    const { name, email, currentPassword, newPassword } = this.profileForm.getRawValue();
    const role = this.profileForm.get('role')?.value;
    if (!currentPassword || !currentPassword.trim()) {
      this.errorMsg = 'יש להזין סיסמה נוכחית';
      this.isLoading = false;
      return;
    }
    // שלח תמיד רק את השדה password: אם מולאה סיסמה חדשה, שלח אותה, אחרת שלח את הנוכחית
    const passwordToSend = (newPassword && newPassword.trim()) ? newPassword : currentPassword;
    const updateData: any = { name, email, role, password: passwordToSend };
    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialog.open(SuccessDialogComponent, {
          width: '320px',
          data: {
            title: 'הצלחה',
            message: 'הפרופיל עודכן בהצלחה!\nאם שינית את הסיסמה, יש להשתמש בסיסמה החדשה בכניסה הבאה.'
          }
        });
        this.profileForm.patchValue({ currentPassword: '', newPassword: '' });
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'שגיאה בעדכון הפרופיל';
        this.isLoading = false;
      }
    });
  }
}

