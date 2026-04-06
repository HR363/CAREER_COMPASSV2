import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { MentorshipService, Session, SessionRequest } from '../../../../core/services/mentorship.service';
import { AiService } from '../../../../core/services/ai.service';

@Component({
  selector: 'app-mentorship',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './mentorship.component.html',
  styleUrls: ['./mentorship.component.scss']
})
export class MentorshipComponent implements OnInit {
  currentUser: User | null = null;
  sessions: Session[] = [];
  mentors: any[] = [];
  recommendedMentors: any[] = [];
  isLoadingRecommendations = false;

  studentRequests: SessionRequest[] = [];

  groupedRequests: any[] = [];
  isLoadingGroupedRequests = false;
  isAcceptingGroup = false;

  scheduleForm: FormGroup;
  isScheduling = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mentorshipService: MentorshipService,
    private aiService: AiService,
    private router: Router
  ) {
    this.scheduleForm = this.fb.group({
      mentorId: ['', [Validators.required]],
      topic: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadSessions();

    if (this.currentUser?.role === 'STUDENT') {
      this.loadMentors();
      this.loadRecommendations();
      this.loadStudentRequests();
    } else if (this.currentUser?.role === 'MENTOR') {
      this.loadGroupedRequests();
    }
  }

  loadRecommendations(): void {
    this.isLoadingRecommendations = true;
    this.aiService.getMentorRecommendations().subscribe({
      next: (recommendations) => {
        this.recommendedMentors = recommendations;
        this.isLoadingRecommendations = false;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
        this.isLoadingRecommendations = false;
      }
    });
  }

  loadSessions(): void {
    this.mentorshipService.getSessions().subscribe({
      next: (sessions: Session[]) => {
        this.sessions = sessions;
      },
      error: (error: any) => {
        console.error('Error loading sessions:', error);
      }
    });
  }

  loadStudentRequests(): void {
    this.mentorshipService.getRequests().subscribe({
      next: (requests) => {
        this.studentRequests = requests;
      },
      error: (error) => {
        console.error('Error loading student requests:', error);
      }
    });
  }

  loadMentors(): void {
    this.mentorshipService.getMentors().subscribe({
      next: (mentors) => {
        this.mentors = mentors;
      },
      error: (error) => {
        console.error('Error loading mentors:', error);
      }
    });
  }

  loadGroupedRequests(): void {
    this.isLoadingGroupedRequests = true;
    this.aiService.groupPendingRequests().subscribe({
      next: (groups) => {
        this.groupedRequests = groups.map(g => ({
          ...g,
          scheduledAt: ''
        }));
        this.isLoadingGroupedRequests = false;
      },
      error: (error) => {
        console.error('Error loading grouped requests:', error);
        this.isLoadingGroupedRequests = false;
      }
    });
  }

  requestSession(): void {
    if (this.scheduleForm.valid) {
      this.isScheduling = true;
      const formData = this.scheduleForm.value;

      this.mentorshipService.requestSession({
        mentorId: formData.mentorId,
        topic: formData.topic,
        description: formData.description
      }).subscribe({
        next: () => {
          this.isScheduling = false;
          this.scheduleForm.reset();
          this.loadStudentRequests();
        },
        error: (error: any) => {
          this.isScheduling = false;
          console.error('Error requesting session:', error);
        }
      });
    }
  }

  acceptGroup(group: any): void {
    if (!group.scheduledAt) {
      alert('Please select a date and time for this session.');
      return;
    }

    this.isAcceptingGroup = true;
    this.mentorshipService.scheduleSession({
      requestIds: group.requestIds,
      topic: group.topic,
      scheduledAt: group.scheduledAt
    }).subscribe({
      next: () => {
        this.isAcceptingGroup = false;
        this.loadSessions();
        this.loadGroupedRequests();
      },
      error: (error) => {
        this.isAcceptingGroup = false;
        console.error('Error scheduling grouped session:', error);
      }
    });
  }

  joinSession(session: Session): void {
    this.router.navigate(['/mentorship/session', session.id]);
  }

  cancelSession(session: Session): void {
    if (confirm('Are you sure you want to cancel this session?')) {
      this.mentorshipService.cancelSession(session.id).subscribe({
        next: () => {
          this.loadSessions();
        },
        error: (error: any) => {
          console.error('Error cancelling session:', error);
        }
      });
    }
  }

  getSessionTitle(session: Session): string {
    if (session.topic) return session.topic;
    if (this.currentUser?.role === 'STUDENT') {
      return 'Session with ' + session.mentor?.name;
    } else {
      return 'Mentorship Group Session';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  }

  canJoinSession(session: Session): boolean {
    const now = new Date();
    const sessionTime = new Date(session.scheduledAt);
    const timeDiff = Math.abs(now.getTime() - sessionTime.getTime()) / (1000 * 60);

    return session.status === 'SCHEDULED' && timeDiff <= 30;
  }

  canCancelSession(session: Session): boolean {
    if (session.status !== 'SCHEDULED') return false;
    
    if (this.currentUser?.role === 'STUDENT') {
      if (session.attendees && session.attendees.length > 1) {
        return false;
      }
    }
    return true;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  browseMentors(): void {
    this.router.navigate(['/mentorship/mentors']);
  }
}

