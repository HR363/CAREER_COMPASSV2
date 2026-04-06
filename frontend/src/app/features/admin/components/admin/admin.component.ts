import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  currentUser: User | null = null;
  stats: any = null;
  sessions: any[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardStats();
    this.loadSessions();
  }

  loadDashboardStats(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
          console.error('Failed to load admin stats', err);
          this.isLoading = false;
      }
    });
  }

  loadSessions(): void {
      this.adminService.getAllSessions().subscribe({
          next: (sessions) => {
              this.sessions = sessions;
          },
          error: (err) => console.error('Failed to load active sessions', err)
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToApplications(): void {
    this.router.navigate(['/admin/applications']);
  }

  navigateToPerformance(): void {
    this.router.navigate(['/admin/performance']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  ghostSession(sessionId: string): void {
      this.router.navigate(['/admin/sessions', sessionId, 'ghost']);
  }
}
