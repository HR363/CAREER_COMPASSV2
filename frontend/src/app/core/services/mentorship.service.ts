import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ScheduleSessionRequest {
  requestIds: string[];
  scheduledAt: string;
  topic?: string;
}

export interface SessionRequest {
  id: string;
  studentId: string;
  mentorId: string;
  sessionId?: string;
  topic: string;
  description?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  student?: any;
  mentor?: any;
}

export interface Session {
  id: string;
  mentorId: string;
  topic?: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  roomId: string;
  mentor?: any;
  attendees?: any[];
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  profile?: {
    education?: string;
    skills?: string;
    interests?: string;
    goals?: string;
  };
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  link: string;
  category: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MentorshipService {
  constructor(private http: HttpClient) {}

  requestSession(request: { mentorId: string; topic: string; description?: string }): Observable<SessionRequest> {
    return this.http.post<SessionRequest>(`${environment.apiUrl}/mentorship/requests`, request);
  }

  getRequests(): Observable<SessionRequest[]> {
    return this.http.get<SessionRequest[]>(`${environment.apiUrl}/mentorship/requests`);
  }

  scheduleSession(request: ScheduleSessionRequest): Observable<Session> {
    return this.http.post<Session>(`${environment.apiUrl}/mentorship/schedule`, request);
  }

  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${environment.apiUrl}/mentorship/sessions`);
  }

  getMentors(): Observable<Mentor[]> {
    return this.http.get<Mentor[]>(`${environment.apiUrl}/users/mentors`);
  }

  getMentorById(mentorId: string): Observable<Mentor> {
    return this.http.get<Mentor>(`${environment.apiUrl}/users/mentors/${mentorId}`);
  }

  getSession(sessionId: string): Observable<Session> {
    return this.http.get<Session>(`${environment.apiUrl}/mentorship/sessions/${sessionId}`);
  }

  joinSession(sessionId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/mentorship/sessions/${sessionId}/join`, {});
  }

  endSession(sessionId: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/mentorship/sessions/${sessionId}/end`, {});
  }

  cancelSession(sessionId: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/mentorship/sessions/${sessionId}/cancel`, {});
  }

  getVideoCallToken(sessionId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/mentorship/sessions/${sessionId}/token`);
  }

  // ==================== RESOURCES ====================

  getMyResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${environment.apiUrl}/mentorship/resources`);
  }

  addResource(data: any): Observable<Resource> {
    return this.http.post<Resource>(`${environment.apiUrl}/mentorship/resources`, data);
  }

  updateResource(resourceId: string, data: any): Observable<Resource> {
    return this.http.put<Resource>(`${environment.apiUrl}/mentorship/resources/${resourceId}`, data);
  }

  deleteResource(resourceId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/mentorship/resources/${resourceId}`);
  }
}
