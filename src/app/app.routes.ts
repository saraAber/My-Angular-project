import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CoursesListComponent } from './courses/courses-list/courses-list.component';
import { CourseDetailsComponent } from './courses/course-details/course-details.component';
import { LessonDetailsComponent } from './courses/lesson-details/lesson-details.component'; // Import LessonDetailsComponent
import { CourseManagementComponent } from './course-management/course-management.component';

// Optional imports if you keep these components
// import { MyCoursesComponent } from './my-courses/my-courses.component';
// import { EnrollmentComponent } from './enrollment/enrollment.component';

export const routes: Routes = [
  // Authentication Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Public Courses Routes (Accessible to all logged-in users)
  { path: 'courses', component: CoursesListComponent },
  { path: 'courses/:id', component: CourseDetailsComponent },

  // Lesson Details Route (Nested under courses/:courseId)
  // This route requires both courseId and lessonId parameters
  { path: 'courses/:courseId/lessons/:lessonId', component: LessonDetailsComponent },

  // Course Management Routes (Typically for Teachers only)
  // You will likely need a Route Guard to protect these routes
  { path: 'course-management', component: CourseManagementComponent },
  // Optional: Route for managing a specific course (e.g., editing, adding lessons)
  // { path: 'course-management/:id', component: CourseManagementComponent }, // Or a different component for editing

  // Optional Routes (Based on your specific needs)
  // { path: 'my-courses', component: MyCoursesComponent }, // For students to view their enrolled courses
  // { path: 'enroll/:id', component: EnrollmentComponent }, // Consider if this is necessary, enrollment is often done via button click

  // Default Route - Redirect to login or courses list if authenticated
  // You might want to redirect to '/courses' if the user is already logged in
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // Optional: Add a wildcard route for 404 pages
  // { path: '**', component: NotFoundComponent } // Assuming you have a NotFoundComponent
];
