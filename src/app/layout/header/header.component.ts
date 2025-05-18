import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="app-header">
      <h1>My Online Courses</h1>
      <nav>
        <ul>
          <li><a routerLink="/courses">Courses</a></li>
          <li><a routerLink="/my-courses">My Courses</a></li>
          <li><a routerLink="/login">Login</a></li>
          <li><a routerLink="/register">Register</a></li>
        </ul>
      </nav>
    </header>
  `,
  styles: [`
    .app-header {
      background-color: #333;
      color: #fff;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .app-header nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
    }

    .app-header nav ul li {
      margin-left: 1.5rem;
    }

    .app-header nav ul li a {
      text-decoration: none;
      color: #fff;
      font-size: 1rem;
    }

    .app-header nav ul li a:hover {
      color: #ddd;
    }
  `]
})
export class HeaderComponent {

}
