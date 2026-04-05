import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getAllSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions`);
  }

  getMentorApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/applications`);
  }

  reviewMentorApplication(applicationId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/applications/${applicationId}/review`, { status });
  }

  getMentorsPerformance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mentors/performance`);
  }

  getMentorPerformanceStats(mentorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mentors/${mentorId}/performance`);
  }

  getSessionGhostToken(sessionId: string): Observable<{ token: string, roomId: string }> {
    return this.http.get<{ token: string, roomId: string }>(`${this.apiUrl}/sessions/${sessionId}/ghost-token`);
  }
}
