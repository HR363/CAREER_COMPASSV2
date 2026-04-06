import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;
  filterRole: string = 'ALL';
  searchQuery: string = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      }
    });
  }

  setFilter(role: string): void {
    this.filterRole = role;
    this.applyFilters();
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value?.toLowerCase() || '';
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.users;

    if (this.filterRole !== 'ALL') {
      result = result.filter(u => u.role === this.filterRole);
    }

    if (this.searchQuery) {
      result = result.filter(u => 
        (u.name && u.name.toLowerCase().includes(this.searchQuery)) ||
        (u.email && u.email.toLowerCase().includes(this.searchQuery))
      );
    }

    this.filteredUsers = result;
  }

  updateRole(userId: string, targetRole: string): void {
    if (confirm(`Change user role to ${targetRole}?`)) {
      this.adminService.updateUserRole(userId, targetRole).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => console.error('Error updating role', err)
      });
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to permanently delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => console.error('Error deleting user', err)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

