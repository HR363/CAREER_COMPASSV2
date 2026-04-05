import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-mentor-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mentor-applications.component.html',
  styleUrls: ['./mentor-applications.component.scss']
})
export class MentorApplicationsComponent implements OnInit {
  applications: any[] = [];
  isLoading = true;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.adminService.getMentorApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load applications', error);
        this.isLoading = false;
      }
    });
  }

  reviewApplication(applicationId: string, status: 'APPROVED' | 'REJECTED'): void {
    this.adminService.reviewMentorApplication(applicationId, status).subscribe({
      next: () => {
        this.loadApplications(); // Refresh the list
      },
      error: (error) => {
        console.error('Failed to review application', error);
      }
    });
  }

  goBack(): void {
      this.router.navigate(['/admin']);
  }
}
