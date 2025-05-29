import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent {
  constructor(
    public authService: AuthService,
    public router: Router
  ) {}

  goBack() {
    window.history.back();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); // ניתוב לדף הבית
  }
}
