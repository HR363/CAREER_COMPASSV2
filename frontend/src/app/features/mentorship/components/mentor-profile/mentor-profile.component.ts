import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MentorshipService, Mentor, Resource } from '../../../../core/services/mentorship.service';
import { MessagesService, Message } from '../../../../core/services/messages.service';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mentor-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mentor-profile.component.html',
  styleUrls: ['./mentor-profile.component.scss']
})
export class MentorProfileComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  mentor: Mentor | null = null;
  currentUser: User | null = null;
  messages: Message[] = [];
  isLoading = true;
  isLoadingMessages = false;
  isSendingMessage = false;
  activeTab: 'profile' | 'resources' | 'messages' = 'profile';
  messageForm: FormGroup;
  scheduleForm: FormGroup;
  isScheduling = false;
  showScheduleModal = false;
  private shouldScrollToBottom = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private mentorshipService: MentorshipService,
    private messagesService: MessagesService,
    private authService: AuthService
  ) {
    this.messageForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
    
    this.scheduleForm = this.fb.group({
      topic: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const mentorId = this.route.snapshot.paramMap.get('id');
    
    if (mentorId) {
      this.loadMentorProfile(mentorId);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadMentorProfile(mentorId: string): void {
    this.isLoading = true;
    this.mentorshipService.getMentorById(mentorId).subscribe({
      next: (mentor) => {
        this.mentor = mentor;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading mentor profile:', error);
        this.isLoading = false;
        this.router.navigate(['/mentorship/mentors']);
      }
    });
  }

  loadMessages(): void {
    if (!this.mentor) return;
    
    this.isLoadingMessages = true;
    this.messagesService.getConversation(this.mentor.id).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoadingMessages = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoadingMessages = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.messageForm.valid || !this.mentor || this.isSendingMessage) return;
    
    const content = this.messageForm.get('content')?.value.trim();
    if (!content) return;
    
    this.isSendingMessage = true;
    this.messagesService.sendMessage({
      receiverId: this.mentor.id,
      content
    }).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.messageForm.reset();
        this.isSendingMessage = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSendingMessage = false;
      }
    });
  }

  scheduleSession(): void {
    if (!this.scheduleForm.valid || !this.mentor || !this.currentUser || this.isScheduling) return;

    this.isScheduling = true;
    const formData = this.scheduleForm.value;

    this.mentorshipService.requestSession({
      mentorId: this.mentor.id,
      topic: formData.topic,
      description: formData.description
    }).subscribe({
      next: () => {
        this.isScheduling = false;
        this.showScheduleModal = false;
        this.scheduleForm.reset();
        // Could show a success notification here
      },
      error: (error) => {
        console.error('Error scheduling session:', error);
        this.isScheduling = false;
      }
    });
  }

  setActiveTab(tab: 'profile' | 'resources' | 'messages'): void {
    this.activeTab = tab;
    if (tab === 'messages' && this.messages.length === 0) {
      this.loadMessages();
    }
  }

  parseSkills(skillsJson: string | undefined): string[] {
    if (!skillsJson) return [];
    try {
      const parsed = JSON.parse(skillsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return skillsJson.split(',').map(s => s.trim());
    }
  }

  parseInterests(interestsJson: string | undefined): string[] {
    if (!interestsJson) return [];
    try {
      const parsed = JSON.parse(interestsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return interestsJson.split(',').map(s => s.trim());
    }
  }

  getResourceIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'article': '📄',
      'book': '📚',
      'pdf': '📑',
      'video': '🎬',
      'course': '🎓',
      'tutorial': '📖',
      'default': '📎'
    };
    return icons[category.toLowerCase()] || icons['default'];
  }

  getResourcesByCategory(category: string): Resource[] {
    if (!this.mentor?.resources) return [];
    return this.mentor.resources.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }

  getAllCategories(): string[] {
    if (!this.mentor?.resources) return [];
    return [...new Set(this.mentor.resources.map(r => r.category))];
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUser?.id;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  openResource(link: string): void {
    window.open(link, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/mentorship/mentors']);
  }

  openScheduleModal(): void {
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.scheduleForm.reset();
  }
}

