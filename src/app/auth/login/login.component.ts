import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

    ngOnInit(): void {
        if (this.authService.getToken()) {
            this.router.navigate(['/courses']);
        }
    }

  login() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.errorMessage = '';
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.errorMessage = 'Invalid email or password.';
          this.successMessage='';
        }
      });
    }
     else {
          this.errorMessage = 'Please enter your email and password.';
        }
  }
}
// import { Component, OnInit } from '@angular/core';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { AuthService } from '../auth.service'; // ייבוא AuthService

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [ReactiveFormsModule, RouterModule,], // ReactiveFormsModule חשוב כאן
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent {
//   loginForm!: FormGroup; // כאן מוגדר ה-FormGroup
//   errorMessage = '';
//   successMessage = '';

//   constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required]
//     });
//   }

//   login() {
//     if (this.loginForm.valid) {
//       const credentials = this.loginForm.value;
//       this.authService.login(credentials).subscribe({
//         next: (response) => {
//           // טיפול בתגובה מוצלחת מהשרת
//           console.log('Login successful', response);
//           // שמירת הטוקן/פרטי משתמש (בהמשך נטפל בזה בצורה מאובטחת יותר)
//           localStorage.setItem('token', response.token);
//           this.router.navigate(['/courses']);
//         },
//         error: (error) => {
//           // טיפול בשגיאה מהשרת
//           console.error('Login failed', error);
//           this.errorMessage = 'Invalid email or password.'; // הצגת הודעת שגיאה למשתמש
//         }
//       });
//     }
//   }
// }
