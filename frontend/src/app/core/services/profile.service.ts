import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UpdateProfileRequest {
  education?: string;
  skills?: string; // JSON string
  interests?: string; // JSON string
  goals?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/profile/me`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${environment.apiUrl}/profile/update`, data);
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/profile/user/${userId}`);
  }

  applyAsMentor(reason: string, resumeUrl?: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/apply-mentor`, { reason, resumeUrl });
  }
}
