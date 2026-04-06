import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService } from '../../../../core/services/ai.service';
import { AuthService } from '../../../../core/services/auth.service';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  chatForm: FormGroup;
  messages: ChatMessage[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    // Initial welcome state handled by template when messages.length === 0
  }

  ngAfterViewChecked(): void {
    // No longer auto-scrolling on every view check, only on new messages
  }

  sendMessage(): void {
    if (this.chatForm.valid && !this.isLoading) {
      const messageText = this.chatForm.get('message')?.value.trim();
      
      if (messageText) {
        // Add user message
        this.addMessage(messageText, true);
        
        // Clear input
        this.chatForm.patchValue({ message: '' });
        
        // Add loading message for AI response
        const loadingMessage = this.addMessage('', false, true);
        
        // Send to AI service
        this.isLoading = true;
        this.aiService.chatWithAI({ message: messageText }).subscribe({
          next: (response: any) => {
            this.isLoading = false;
            this.removeMessage(loadingMessage.id);
            this.addMessage(response.response, false);
          },
          error: (error: any) => {
            this.isLoading = false;
            this.removeMessage(loadingMessage.id);
            this.addMessage('Sorry, I encountered an error. Please try again.', false);
            console.error('Chat error:', error);
          }
        });
      }
    }
  }

  private addMessage(content: string, isUser: boolean, isLoading: boolean = false): ChatMessage {
    const message: ChatMessage = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      content,
      isUser,
      timestamp: new Date(),
      isLoading
    };
    
    this.messages.push(message);
    return message;
  }

  private removeMessage(messageId: string): void {
    this.messages = this.messages.filter(m => m.id !== messageId);
  }

  private scrollToBottom(): void {
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  formatMessage(content: string): string {
    // Simple formatting for line breaks and basic markdown
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<p><\/p>/g, '') // remove empty tags
      .replace(/^/g, '<p>')
      .replace(/$/g, '</p>');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

