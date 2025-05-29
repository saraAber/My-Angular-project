import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatInputModule, MatButtonModule]
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
          // מעבר אוטומטי לדף הבית לאחר הרשמה מוצלחת
          this.router.navigate(['/home'], { replaceUrl: true });
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
        next: () => {
          alert('התחברת בהצלחה!');
          this.router.navigate(['/courses'], { replaceUrl: true });
        },
        error: (err) => {
          this.errorMsg = 'אחד הנתונים שהזנתם שגוי';
        }
      });
    }
  }
}
