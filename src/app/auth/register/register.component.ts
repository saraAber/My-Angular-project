import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = ''; // הודעת הצלחה

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['student', Validators.required] // ערך ברירת מחדל 'student'
    });
  }

  register() {
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.successMessage = 'Registration successful! Please log in.'; //הודעת הצלחה
          this.errorMessage = '';
          this.router.navigate(['/login']); // ניתוב ישיר לlogin
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.errorMessage = 'Registration failed. Please try again.';
          this.successMessage = '';
        }
      });
    } else {
        this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}

// import { Component } from '@angular/core';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { AuthService } from '../auth.service';

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [ReactiveFormsModule, RouterModule, ], // הוספה ל-imports
//   templateUrl: './register.component.html',
//   styleUrls: ['./register.component.css']
// })
// export class RegisterComponent {
//   registerForm: FormGroup;
//   errorMessage = '';

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService
//   ) {
//     this.registerForm = this.fb.group({
//       name: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required],
//       role:['', Validators.required] // הוספת שדה תפקיד
//     });
//   }

//   register() {
//     if (this.registerForm.valid) {
//       const userData = this.registerForm.value;
//       this.authService.register(userData).subscribe({
//         next: (response) => {
//           console.log('Registration successful', response);
//           this.router.navigate(['/login']);
//         },
//         error: (error) => {
//           console.error('Registration failed', error);
//           this.errorMessage = 'Registration failed. Please try again.';
//         }
//       });
//     }
//   }
// }