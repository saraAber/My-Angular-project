import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './../services/auth.service'; // Import your AuthService
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Get the expected roles from the route data
    // Example: In your route definition: data: { roles: ['teacher'] }
    const expectedRoles = route.data['roles'] as string[]; // Cast to string array

    // First, check if the user is authenticated using the AuthService
    // We can reuse the isAuthenticated$ observable from AuthService
    return this.authService.isAuthenticated$.pipe(
      // Use switchMap to switch from isAuthenticated$ to a new observable based on authentication state
      // Or simply map and check the role directly if currentUser$ is reliable
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // If not authenticated, redirect to login
          console.warn('Access denied: User not authenticated. Redirecting to login.');
          return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }

        // If authenticated, get the current user object using the new public method
        const currentUser = this.authService.getCurrentUserValue(); // Use the public getter
        const userRole = currentUser ? currentUser.role : null;

        // Check if the user's role is included in the expected roles
        if (userRole && expectedRoles && expectedRoles.includes(userRole)) {
          // User has the required role, allow access
          return true;
        } else {
          // User is authenticated but does not have the required role
          console.warn(`Access denied: User role '${userRole}' is not in expected roles '${expectedRoles}'.`);
          // Redirect to a forbidden page or the home page
          // You might want to show a MatSnackBar message here as well
          this.router.navigate(['/courses']); // Redirect to courses list as a default forbidden page
          return false; // Deny access
        }
      }),
      // Optional: Tap into the result for logging
      tap(canActivateResult => {
         if (canActivateResult !== true && canActivateResult instanceof UrlTree) {
             console.log('Redirecting (RoleGuard):', canActivateResult.toString());
         } else if (canActivateResult === false) {
             console.log('Access denied by RoleGuard.');
         }
      })
    );
  }
}
