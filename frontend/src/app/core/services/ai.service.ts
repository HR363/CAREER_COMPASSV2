import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CareerRecommendationRequest {
  skills: string;
  interests: string;
  education?: string;
  goals?: string;
}

export interface LearningPathRequest {
  careerPath: string;
  currentSkills: string;
  timeframe?: string;
}

export interface ChatRequest {
  message: string;
  context?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  constructor(private http: HttpClient) {}

  getCareerRecommendations(request: CareerRecommendationRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/ai/recommend-career`, request);
  }

  getLearningPath(request: LearningPathRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/ai/learning-path`, request);
  }

  getMentorRecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ai/mentors`);
  }

  chatWithAI(request: ChatRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/ai/chat`, request);
  }
}
