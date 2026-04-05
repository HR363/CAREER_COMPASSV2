import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="app-container">
      <app-navbar *ngIf="!router.url.includes('/chat')"></app-navbar>
      <main class="main-content" [style.padding-top]="router.url.includes('/chat') ? '0' : '64px'">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #0a0a14;
    }
    .main-content {
      /* Padding applied dynamically via template style binding */
    }
  `]
})
export class AppComponent {
  title = 'CareerCompass AI';
  constructor(public router: Router) {}
}
