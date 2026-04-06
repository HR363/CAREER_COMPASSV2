import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import { AiService } from '../../../../core/services/ai.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { MentorshipService, Resource, Session } from '../../../../core/services/mentorship.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgChartsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isUpdating = false;
  isGeneratingRecommendations = false;
  recommendations: any[] = [];
  
  // Roadmap State
  isGeneratingRoadmap = false;
  activeRoadmapCareer: string | null = null;
  selectedRoadmap: any = null;

  // Mentor State
  resources: Resource[] = [];
  mentorSessions: Session[] = [];
  isLoadingResources = false;
  isLoadingSessions = false;
  showAddResourceModal = false;
  editingResource: Resource | null = null;
  resourceForm: FormGroup;
  isSubmitting = false;
  toastMessage: string | null = null;

  showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  // Chart Data
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#e2e8f0' // Light text for dark background
        }
      }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)', // green
        'rgba(139, 92, 246, 0.8)', // green
        'rgba(236, 72, 153, 0.8)', // Pink
        'rgba(34, 197, 94, 0.8)',  // Green
        'rgba(234, 179, 8, 0.8)',  // Yellow
        'rgba(59, 130, 246, 0.8)', // Blue
      ],
      hoverBackgroundColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(59, 130, 246, 1)',
      ],
      hoverBorderColor: '#ffffff'
    }]
  };
  public pieChartType: ChartType = 'pie';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private aiService: AiService,
    private profileService: ProfileService,
    private mentorshipService: MentorshipService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      education: [''],
      skills: [''],
      interests: [''],
      goals: ['']
    });
    
    this.resourceForm = this.fb.group({
      title: ['', Validators.required],
      link: [''],
      category: ['article', Validators.required]
    });
  }

  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProfile();
    
    // Load mentor-specific data
    if (this.currentUser?.role === 'MENTOR') {
      this.loadMentorResources();
      this.loadMentorSessions();
    }
  }

  loadProfile(): void {
    if (this.currentUser?.profile) {
      const profile = this.currentUser.profile;
      this.profileForm.patchValue({
        education: profile.education || '',
        skills: profile.skills ? JSON.parse(profile.skills).join(', ') : '',
        interests: profile.interests ? JSON.parse(profile.interests).join(', ') : '',
        goals: profile.goals || ''
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdating = true;

      const formData = this.profileForm.value;
      const profileData = {
        education: formData.education,
        skills: formData.skills ? JSON.stringify(formData.skills.split(',').map((s: string) => s.trim())) : '[]',
        interests: formData.interests ? JSON.stringify(formData.interests.split(',').map((s: string) => s.trim())) : '[]',
        goals: formData.goals
      };

      this.profileService.updateProfile(profileData).subscribe({
        next: (updatedProfile) => {
          this.isUpdating = false;
          // Update local user data
          if (this.currentUser) {
            this.currentUser.profile = updatedProfile;
            // Update storage to persist changes
            localStorage.setItem('user', JSON.stringify(this.currentUser));
          }
          console.log('Profile updated:', updatedProfile);
          alert('Profile updated successfully!');
        },
        error: (error) => {
          this.isUpdating = false;
          console.error('Error updating profile:', error);
          alert('Failed to update profile. Please try again.');
        }
      });
    }
  }

  getCareerRecommendations(): void {
    if (!this.profileForm.valid) {
      alert('Please fill in your profile information first');
      return;
    }

    this.isGeneratingRecommendations = true;
    // Reset roadmap state when generating new recommendations
    this.activeRoadmapCareer = null;
    this.selectedRoadmap = null;

    const formData = this.profileForm.value;
    const requestData = {
      skills: formData.skills || '',
      interests: formData.interests || '',
      education: formData.education || '',
      goals: formData.goals || ''
    };

    this.aiService.getCareerRecommendations(requestData).subscribe({
      next: (response: any) => {
        this.isGeneratingRecommendations = false;
        // Handle the response structure - suggestedCareers contains the array
        let careers = response?.suggestedCareers || response;
        
        // If it's still a string, try to parse it
        if (typeof careers === 'string') {
          try {
            // Strip markdown code fences if present
            let cleaned = careers.trim();
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
            cleaned = cleaned.replace(/\n?```\s*$/i, '');
            careers = JSON.parse(cleaned.trim());
          } catch (e) {
            console.error('Failed to parse careers:', e);
            careers = [];
          }
        }
        
        // Ensure it's an array
        this.recommendations = Array.isArray(careers) ? careers : [];
        console.log('Career recommendations:', this.recommendations);
      },
      error: (error: any) => {
        this.isGeneratingRecommendations = false;
        console.error('Error getting recommendations:', error);
        alert('Failed to generate recommendations. Please try again.');
      }
    });
  }

  generateRoadmap(career: any): void {
    const careerTitle = career.title;
    
    // If clicking same career, toggle visibility
    if (this.activeRoadmapCareer === careerTitle && this.selectedRoadmap) {
      this.activeRoadmapCareer = null;
      return;
    }

    this.activeRoadmapCareer = careerTitle;
    this.selectedRoadmap = null;
    this.isGeneratingRoadmap = true;

    const request = {
      careerPath: careerTitle,
      currentSkills: this.profileForm.get('skills')?.value || '',
      timeframe: '6 months'
    };

    this.aiService.getLearningPath(request).subscribe({
      next: (response: any) => {
        this.isGeneratingRoadmap = false;
        
        let roadmap = response?.learningPath || response;
        if (typeof roadmap === 'string') {
          try {
            let cleaned = roadmap.trim();
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
            cleaned = cleaned.replace(/\n?```\s*$/i, '');
            roadmap = JSON.parse(cleaned);
          } catch (e) {
            console.error('Failed to parse roadmap:', e);
            roadmap = null;
          }
        }
        
        this.selectedRoadmap = roadmap;
        this.updateChartData();
        console.log('Generated Roadmap:', this.selectedRoadmap);
      },
      error: (err) => {
        this.isGeneratingRoadmap = false;
        console.error('Error generating roadmap:', err);
        alert('Failed to generate learning path. Please try again.');
        this.activeRoadmapCareer = null;
      }
    });
  }

  // Helper to safely get phases if it's nested or direct
  getRoadmapPhases(): any[] {
    if (!this.selectedRoadmap) return [];
    if (Array.isArray(this.selectedRoadmap)) return this.selectedRoadmap; // If it's just the array
    if (this.selectedRoadmap.phases && Array.isArray(this.selectedRoadmap.phases)) return this.selectedRoadmap.phases;
    // Walkaround if it's wrapped differently
    return [];
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MENTOR':
        return 'bg-green-100 text-green-800';
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // ==================== MENTOR METHODS ====================

  loadMentorResources(): void {
    this.isLoadingResources = true;
    this.mentorshipService.getMyResources().subscribe({
      next: (resources) => {
        this.resources = resources;
        this.isLoadingResources = false;
      },
      error: (error) => {
        console.error('Error loading resources:', error);
        this.isLoadingResources = false;
      }
    });
  }

  loadMentorSessions(): void {
    this.isLoadingSessions = true;
    this.mentorshipService.getSessions().subscribe({
      next: (sessions) => {
        this.mentorSessions = sessions;
        this.isLoadingSessions = false;
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        this.isLoadingSessions = false;
      }
    });
  }

  openAddResourceModal(): void {
    this.editingResource = null;
    this.selectedFile = null;
    this.resourceForm.reset({ category: 'article' });
    this.showAddResourceModal = true;
  }

  openEditResourceModal(resource: Resource): void {
    this.editingResource = resource;
    this.selectedFile = null;
    this.resourceForm.patchValue({
      title: resource.title,
      link: resource.link,
      category: resource.category
    });
    this.showAddResourceModal = true;
  }

  closeResourceModal(): void {
    this.showAddResourceModal = false;
    this.editingResource = null;
    this.selectedFile = null;
    this.resourceForm.reset({ category: 'article' });
  }

  saveResource(): void {
    if (this.resourceForm.invalid) return;

    const data = this.resourceForm.value;
    if (!data.link && !this.selectedFile && !this.editingResource?.link) {
      alert('Please provide a URL link or upload a file.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category', data.category);
    if (data.link) {
      formData.append('link', data.link);
    }
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.editingResource) {
      this.mentorshipService.updateResource(this.editingResource.id, formData).subscribe({
        next: () => {
          this.loadMentorResources();
          this.closeResourceModal();
          this.showToast('Resource updated successfully');
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating resource:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      this.mentorshipService.addResource(formData).subscribe({
        next: () => {
          this.loadMentorResources();
          this.closeResourceModal();
          this.showToast('Resource added successfully');
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error adding resource:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteResource(resourceId: string): void {
    if (confirm('Are you sure you want to delete this resource?')) {
      this.mentorshipService.deleteResource(resourceId).subscribe({
        next: () => this.loadMentorResources(),
        error: (error) => console.error('Error deleting resource:', error)
      });
    }
  }

  getResourceIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'article': '📄',
      'book': '📚',
      'pdf': '📑',
      'video': '🎬',
      'course': '🎓',
      'tutorial': '📖'
    };
    return icons[category?.toLowerCase()] || '📎';
  }

  getUpcomingSessions(): Session[] {
    return this.mentorSessions.filter(s => s.status === 'SCHEDULED');
  }

  getSessionTitle(session: any): string {
     if (session.topic) return session.topic;
     if (!session.attendees || session.attendees.length === 0) return 'Session';
     return session.attendees.length > 1 ? `Group Session (${session.attendees.length})` : `Session with ${session.attendees[0].student?.name || 'Student'}`;
  }

  getCompletedSessions(): Session[] {
    return this.mentorSessions.filter(s => s.status === 'COMPLETED');
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  updateChartData(): void {
    const phases = this.getRoadmapPhases();
    const labels: string[] = [];
    const data: number[] = [];

    phases.forEach(phase => {
      labels.push(phase.name);
      data.push(this.parseDurationToWeeks(phase.duration));
    });

    this.pieChartData = {
      ...this.pieChartData,
      labels: labels,
      datasets: [{
        ...this.pieChartData.datasets[0],
        data: data
      }]
    };
  }

  parseDurationToWeeks(duration: string): number {
    if (!duration) return 1;
    const lowerDuration = duration.toLowerCase();
    
    // Extract number
    const match = lowerDuration.match(/(\d+)/);
    const num = match ? parseInt(match[0]) : 1;

    if (lowerDuration.includes('month')) {
      return num * 4;
    } else if (lowerDuration.includes('year')) {
      return num * 52;
    } else if (lowerDuration.includes('week')) {
      return num;
    } else if (lowerDuration.includes('day')) {
      return num / 7;
    }
    return num;
  }
}



