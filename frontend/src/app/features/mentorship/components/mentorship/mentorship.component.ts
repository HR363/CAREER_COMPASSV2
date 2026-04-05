import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { MentorshipService, Session } from '../../../../core/services/mentorship.service';
import { AiService } from '../../../../core/services/ai.service';

@Component({
  selector: 'app-mentorship',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mentorship.component.html',
  styleUrls: ['./mentorship.component.scss']
})
export class MentorshipComponent implements OnInit {
  currentUser: User | null = null;
  sessions: Session[] = [];
  mentors: any[] = [];
  recommendedMentors: any[] = [];
  isLoadingRecommendations = false;
  
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
      scheduledAt: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadSessions();
    
    if (this.currentUser?.role === 'STUDENT') {
      this.loadMentors();
      this.loadRecommendations();
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

  scheduleSession(): void {
    if (this.scheduleForm.valid) {
      this.isScheduling = true;
      
      const formData = this.scheduleForm.value;
      const scheduleData = {
        mentorId: formData.mentorId,
        studentId: this.currentUser!.id,
        scheduledAt: formData.scheduledAt,
        description: formData.description
      };

      this.mentorshipService.scheduleSession(scheduleData).subscribe({
        next: (session: any) => {
          this.isScheduling = false;
          this.scheduleForm.reset();
          this.loadSessions();
        },
        error: (error: any) => {
          this.isScheduling = false;
          console.error('Error scheduling session:', error);
        }
      });
    }
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
    if (this.currentUser?.role === 'STUDENT') {
      return `Session with ${session.mentor?.name}`;
    } else {
      return `Session with ${session.student?.name}`;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  }

  canJoinSession(session: Session): boolean {
    const now = new Date();
    const sessionTime = new Date(session.scheduledAt);
    const timeDiff = Math.abs(now.getTime() - sessionTime.getTime()) / (1000 * 60); // minutes
    
    return session.status === 'SCHEDULED' && timeDiff <= 30; // Can join 30 minutes before/after
  }

  canCancelSession(session: Session): boolean {
    return session.status === 'SCHEDULED';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  browseMentors(): void {
    this.router.navigate(['/mentorship/mentors']);
  }
}

