import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { MentorApplicationsComponent } from './components/mentor-applications/mentor-applications.component';
import { MentorPerformanceComponent } from './components/mentor-performance/mentor-performance.component';
import { SessionGhostComponent } from './components/session-ghost/session-ghost.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent
  },
  {
    path: 'applications',
    component: MentorApplicationsComponent
  },
  {
    path: 'performance',
    component: MentorPerformanceComponent
  },
  {
    path: 'users',
    component: UserManagementComponent
  },
  {
    path: 'sessions/:id/ghost',
    component: SessionGhostComponent
  }
];

