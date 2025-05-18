import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './../services/auth.service'; // Import your AuthService
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Check if the user is authenticated using the AuthService
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          // User is authenticated, allow access
          return true;
        } else {
          // User is not authenticated, redirect to login page
          console.warn('Access denied: User not authenticated. Redirecting to login.');
          // Return a UrlTree to redirect
          return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }
      }),
      // Optional: Tap into the result for logging or side effects
      tap(canActivate => {
         if (canActivate !== true && canActivate instanceof UrlTree) {
             console.log('Redirecting to login:', canActivate.toString());
         }
      })
    );
  }

  // Optional: Implement CanActivateChild if you have child routes that need protection
  // canActivateChild(
  //   childRoute: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return this.canActivate(childRoute, state); // Use the same logic as CanActivate
  // }
}

