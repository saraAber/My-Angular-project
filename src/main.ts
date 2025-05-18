import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/auth/interceptor';
import { importProvidersFrom, Provider } from '@angular/core'; // <-- הוסף Provider
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes';
import { AuthService } from './app/auth/auth.service';
import { CourseService } from './app/courses/course.service';

const authInterceptorProvider: Provider = { // <-- הגדר ספק
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true,
};

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    authInterceptorProvider, // <-- השתמש בספק שהוגדר
    AuthService,
    CourseService,
    importProvidersFrom(RouterModule.forRoot(routes))
  ]
}).catch(err => console.error(err));