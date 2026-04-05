import { Routes } from '@angular/router';
import { MentorshipComponent } from './components/mentorship/mentorship.component';
import { VideoCallComponent } from './components/video-call/video-call.component';
import { MentorsListComponent } from './components/mentors-list/mentors-list.component';
import { MentorProfileComponent } from './components/mentor-profile/mentor-profile.component';

export const mentorshipRoutes: Routes = [
  {
    path: '',
    component: MentorshipComponent
  },
  {
    path: 'mentors',
    component: MentorsListComponent
  },
  {
    path: 'mentor/:id',
    component: MentorProfileComponent
  },
  {
    path: 'session/:id',
    component: VideoCallComponent
  }
];

