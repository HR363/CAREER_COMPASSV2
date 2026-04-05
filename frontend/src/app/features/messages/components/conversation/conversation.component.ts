import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessagesService, Message } from '../../../../core/services/messages.service';
import { AuthService, User } from '../../../../core/services/auth.service';
import { interval, Subscription } from 'rxjs';

interface OtherUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  messages: Message[] = [];
  currentUser: User | null = null;
  otherUser: OtherUser | null = null;
  otherUserId: string = '';
  messageForm: FormGroup;
  isLoading = true;
  isSending = false;
  isTyping = false;
  showUserInfo = false;
  private shouldScrollToBottom = false;
  private refreshSubscription?: Subscription;

  // Avatar gradient colors
  private avatarGradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #14b8a6, #06b6d4)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
    'linear-gradient(135deg, #8b5cf6, #d946ef)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #3b82f6, #6366f1)',
    'linear-gradient(135deg, #ef4444, #ec4899)',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private messagesService: MessagesService,
    private authService: AuthService
  ) {
    this.messageForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.otherUserId = this.route.snapshot.paramMap.get('userId') || '';
    
    if (this.otherUserId) {
      this.loadMessages();
      
      // Poll for new messages every 5 seconds
      this.refreshSubscription = interval(5000).subscribe(() => {
        this.loadMessages(false);
      });
    } else {
      this.router.navigate(['/messages']);
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadMessages(showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    this.messagesService.getConversation(this.otherUserId).subscribe({
      next: (messages) => {
        const wasAtBottom = this.isScrolledToBottom();
        const hadMessages = this.messages.length > 0;
        
        this.messages = messages;
        this.isLoading = false;
        
        // Extract other user info from first message
        if (messages.length > 0 && !this.otherUser) {
          const firstMsg = messages[0];
          this.otherUser = firstMsg.senderId === this.otherUserId 
            ? firstMsg.sender as OtherUser
            : firstMsg.receiver as OtherUser;
        }
        
        // Scroll to bottom on initial load or if was already at bottom
        if (!hadMessages || wasAtBottom) {
          this.shouldScrollToBottom = true;
        }
        
        // Mark messages as read
        this.markUnreadAsRead();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.messageForm.valid || this.isSending) return;

    const content = this.messageForm.get('content')?.value.trim();
    if (!content) return;

    this.isSending = true;
    this.messagesService.sendMessage({
      receiverId: this.otherUserId,
      content
    }).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.messageForm.reset();
        this.isSending = false;
        this.shouldScrollToBottom = true;
        
        // Reset textarea height
        if (this.messageInput) {
          this.messageInput.nativeElement.style.height = 'auto';
        }
        
        // Set other user info if not set
        if (!this.otherUser && message.receiver) {
          this.otherUser = message.receiver as OtherUser;
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending = false;
        alert('Failed to send message. Please try again.');
      }
    });
  }

  private markUnreadAsRead(): void {
    const unreadMessages = this.messages.filter(
      m => m.receiverId === this.currentUser?.id && !m.isRead
    );
    
    unreadMessages.forEach(message => {
      this.messagesService.markAsRead(message.id).subscribe();
    });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private isScrolledToBottom(): boolean {
    if (!this.messagesContainer) return true;
    const el = this.messagesContainer.nativeElement;
    return el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
  }

  goBack(): void {
    this.router.navigate(['/messages']);
  }

  getMessageTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  }

  shouldShowDateDivider(index: number): boolean {
    if (index === 0) return true;
    const currentDate = new Date(this.messages[index].createdAt).toDateString();
    const prevDate = new Date(this.messages[index - 1].createdAt).toDateString();
    return currentDate !== prevDate;
  }

  shouldShowAvatar(index: number): boolean {
    if (index === this.messages.length - 1) return true;
    const currentSender = this.messages[index].senderId;
    const nextSender = this.messages[index + 1].senderId;
    return currentSender !== nextSender;
  }

  shouldShowTail(index: number): boolean {
    if (index === 0) return false;
    const currentSender = this.messages[index].senderId;
    const prevSender = this.messages[index - 1].senderId;
    return currentSender === prevSender;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  getAvatarGradient(name: string): string {
    const charCode = (name || '').charCodeAt(0) || 0;
    return this.avatarGradients[charCode % this.avatarGradients.length];
  }

  getUserInitial(): string {
    return this.otherUser?.name?.charAt(0).toUpperCase() || '?';
  }
}
