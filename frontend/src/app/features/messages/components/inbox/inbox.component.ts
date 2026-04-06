import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessagesService, Conversation } from '../../../../core/services/messages.service';
import { AuthService, User } from '../../../../core/services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  currentUser: User | null = null;
  isLoading = true;
  searchQuery = '';
  private refreshSubscription?: Subscription;

  // Avatar gradient colors based on name
  private avatarGradients = [
    'linear-gradient(135deg, #22c55e, #16a34a)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #14b8a6, #06b6d4)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
    'linear-gradient(135deg, #16a34a, #d946ef)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #3b82f6, #22c55e)',
    'linear-gradient(135deg, #ef4444, #ec4899)',
  ];

  constructor(
    private messagesService: MessagesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadConversations();
    
    // Poll for new messages every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadConversations(false);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadConversations(showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
    }
    
    this.messagesService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.filterConversations();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.isLoading = false;
      }
    });
  }

  filterConversations(): void {
    if (!this.searchQuery.trim()) {
      this.filteredConversations = this.conversations;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredConversations = this.conversations.filter(conv =>
        conv.user.name.toLowerCase().includes(query) ||
        conv.user.email.toLowerCase().includes(query) ||
        conv.lastMessage.content.toLowerCase().includes(query)
      );
    }
  }

  openConversation(userId: string): void {
    this.router.navigate(['/messages/conversation', userId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getTotalUnread(): number {
    return this.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  }

  getAvatarGradient(name: string): string {
    const charCode = name.charCodeAt(0) || 0;
    return this.avatarGradients[charCode % this.avatarGradients.length];
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'MENTOR': return 'badge-mentor';
      case 'STUDENT': return 'badge-student';
      case 'ADMIN': return 'badge-admin';
      default: return '';
    }
  }
}

