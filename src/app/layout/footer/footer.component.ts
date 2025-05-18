import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  template: `
    <footer style="background-color: #333; color: #fff; padding: 1rem; text-align: center; position: fixed; bottom: 0; width: 100%;">
      <p style="margin: 0;">&copy; {{ year }} My Online Courses. All rights reserved.</p>
    </footer>
  `,
  styles: [`
  .app-footer {
      background-color: #333;
      color: #fff;
      padding: 1rem;
      text-align: center;
      position: fixed;
      bottom: 0;
      width: 100%;
      font-size: 0.9rem;
    }

    .app-footer p {
      margin: 0;
    }
  `]
})
export class FooterComponent {
  year: number = new Date().getFullYear();
}
