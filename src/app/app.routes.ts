import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { CourseDetailsComponent } from './courses/course-details/course-details.component';
import { MyCoursesComponent } from './my-courses/my-courses.component';
import { EnrollmentComponent } from './enrollment/enrollment.component'; // ייבוא הקומפוננטה החדשה

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'courses', component: CoursesListComponent },
  { path: 'courses/:id', component: CourseDetailsComponent },
  { path: 'my-courses', component: MyCoursesComponent },
  { path: 'enroll/:id', component: EnrollmentComponent }, // הוספת ה-Route החדש עם פרמטר id של הקורס
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];