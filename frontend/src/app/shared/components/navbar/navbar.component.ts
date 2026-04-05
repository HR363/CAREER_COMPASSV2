import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { MessagesService } from '../../../core/services/messages.service';
import { Subscription, filter, interval } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isScrolled = false;
  isMobileMenuOpen = false;
  currentRoute = '';
  unreadCount = 0;
  private authSub?: Subscription;
  private routerSub?: Subscription;
  private unreadSub?: Subscription;

  constructor(
    private authService: AuthService,
    private messagesService: MessagesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUnreadCount();
      } else {
        this.unreadCount = 0;
      }
    });

    this.routerSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.currentRoute = event.urlAfterRedirects;
      this.isMobileMenuOpen = false;
      // Refresh unread count on navigation
      if (this.currentUser) {
        this.loadUnreadCount();
      }
    });

    this.currentRoute = this.router.url;
    
    // Initial load of unread count
    if (this.currentUser) {
      this.loadUnreadCount();
    }
    
    // Refresh unread count every 30 seconds
    this.unreadSub = interval(30000).subscribe(() => {
      if (this.currentUser) {
        this.loadUnreadCount();
      }
    });
  }

  private loadUnreadCount(): void {
    this.messagesService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount = response.count;
      },
      error: () => {
        // Silently fail - unread count is not critical
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.routerSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  get isLandingPage(): boolean {
    return this.currentRoute === '/' || this.currentRoute === '';
  }

  get isAuthPage(): boolean {
    return this.currentRoute.includes('/auth/');
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getUserInitial(): string {
    return this.currentUser?.name?.charAt(0).toUpperCase() || 'U';
  }
}
