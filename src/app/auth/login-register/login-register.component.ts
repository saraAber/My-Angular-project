import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule,FormsModule, CommonModule, MatInputModule, MatButtonModule]
})
export class LoginRegisterComponent implements OnInit {
  form!: FormGroup;
  isRegister = false;
  showPassword = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router, private authService: AuthService) {}
  

  private buildForm() {
    this.form = this.fb.group({
      name: ['', this.isRegister ? [Validators.required] : []],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', this.isRegister ? [Validators.required] : []]
    });
  }

  ngOnInit() {
    this.buildForm();
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.errorMsg = '';
    this.buildForm();
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMsg = '';
    if (this.isRegister) {
      this.auth.register(this.form.value).subscribe({
        next: (res: any) => {
          let msg = 'נרשמת בהצלחה!';
          // נסה לפרסר JSON אם אפשר
          if (typeof res === 'string') {
            try {
              const parsed = JSON.parse(res);
              msg = parsed.message || msg;
            } catch {
              // אם זה טקסט בלבד, לא נורא
            }
          } else if (res && res.message) {
            msg = res.message;
          }
          alert(msg);
          this.toggleMode();
        },
        error: (err) => {
          if (
            err &&
            err.error &&
            (err.error.message?.includes('exists') || err.error.message?.includes('קיים'))
          ) {
            this.errorMsg = 'מייל זה כבר קיים במערכת';
          } else {
            this.errorMsg = 'שגיאה בהרשמה. נסה שוב.';
          }
        }
      });
    } else {
      const loginPayload = {
        email: this.form.value.email,
        password: this.form.value.password
      };
      this.auth.login(loginPayload.email, loginPayload.password).subscribe({
        next: (res: any) => {
          let msg = 'התחברת בהצלחה!';
          let token = '';
          // נסה לפרסר JSON אם אפשר
          if (typeof res === 'string') {
            try {
              const parsed = JSON.parse(res);
              token = parsed.token || '';
              msg = parsed.message || msg;
            } catch {
              // אם זה טקסט בלבד, לא נורא
              token = '';
            }
          } else if (res && res.token) {
            token = res.token;
            msg = res.message || msg;
          }
          if (token) {
            localStorage.setItem('token', token);
            console.log('טוקן:', token);
          }
          alert(msg);
          this.router.navigate(['/courses'], { replaceUrl: true });
        },
        error: (err) => {
          this.errorMsg = 'אחד הנתונים שהזנתם שגוי';
        }
      });
    }
  }
}
