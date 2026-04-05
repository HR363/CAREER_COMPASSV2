import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-mentor-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-performance.component.html',
  styleUrls: ['./mentor-performance.component.scss']
})
export class MentorPerformanceComponent implements OnInit {
  mentorsStats: any[] = [];
  isLoading = true;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadPerformanceStats();
  }

  loadPerformanceStats(): void {
    this.adminService.getMentorsPerformance().subscribe({
      next: (data) => {
        this.mentorsStats = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load mentor performance stats', error);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
      this.router.navigate(['/admin']);
  }
}
