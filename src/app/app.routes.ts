import { Routes } from '@angular/router';
import { LoginRegisterComponent } from './auth/login-register/login-register.component';
import { CoursesComponent } from './courses/courses/courses.component';
import { CourseDetailsComponent } from './courses/course-details/course-details.component';
import { LessonDetailsComponent } from './courses/lesson-details/lesson-details.component';
import { CoursesListEditableComponent } from './courses/courses-list-editable/courses-list-editable.component';

import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'auth', component: LoginRegisterComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'courses/editable', component: CoursesListEditableComponent }, // רשימת קורסים עם עריכה
  { path: 'courses/:id', component: CourseDetailsComponent },
  { path: 'courses/:courseId/lessons/:lessonId', component: LessonDetailsComponent }, // מסך פרטי שיעור
  { path: 'profile', component: ProfileComponent },

  { path: '', component: HomeComponent },         // דף הבית כברירת מחדל
  { path: '**', redirectTo: '' },                          // נתיב לא קיים - הפניה לדף הבית
];

