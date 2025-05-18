import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component'; // ייבוא HeaderComponent
import { FooterComponent } from './layout/footer/footer.component'; // ייבוא FooterComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent], // הוספה ל-imports
  template: `
    <app-header></app-header>
    <div style="margin-bottom: 60px;"> <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-test-app';
}