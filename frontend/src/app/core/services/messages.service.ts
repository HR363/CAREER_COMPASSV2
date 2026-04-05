import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Conversation {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  constructor(private http: HttpClient) {}

  sendMessage(request: SendMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${environment.apiUrl}/messages/send`, request);
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${environment.apiUrl}/messages/conversations`);
  }

  getConversation(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/messages/conversation/${userId}`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/messages/unread-count`);
  }

  markAsRead(messageId: string): Observable<Message> {
    return this.http.put<Message>(`${environment.apiUrl}/messages/${messageId}/read`, {});
  }
}
