import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorshipService, Mentor } from '../../../../core/services/mentorship.service';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mentors-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentors-list.component.html',
  styleUrls: ['./mentors-list.component.scss']
})
export class MentorsListComponent implements OnInit {
  mentors: Mentor[] = [];
  filteredMentors: Mentor[] = [];
  currentUser: User | null = null;
  isLoading = true;
  searchQuery = '';
  selectedSkill = '';
  allSkills: string[] = [];

  constructor(
    private mentorshipService: MentorshipService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMentors();
  }

  loadMentors(): void {
    this.isLoading = true;
    this.mentorshipService.getMentors().subscribe({
      next: (mentors) => {
        this.mentors = mentors;
        this.filteredMentors = mentors;
        this.extractAllSkills();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading mentors:', error);
        this.isLoading = false;
      }
    });
  }

  extractAllSkills(): void {
    const skillsSet = new Set<string>();
    this.mentors.forEach(mentor => {
      if (mentor.profile?.skills) {
        try {
          const skills = JSON.parse(mentor.profile.skills);
          if (Array.isArray(skills)) {
            skills.forEach((skill: string) => skillsSet.add(skill));
          }
        } catch (e) {
          // If not valid JSON, treat as comma-separated or single skill
          mentor.profile.skills.split(',').forEach(s => skillsSet.add(s.trim()));
        }
      }
    });
    this.allSkills = Array.from(skillsSet).sort();
  }

  filterMentors(): void {
    this.filteredMentors = this.mentors.filter(mentor => {
      const matchesSearch = !this.searchQuery || 
        mentor.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        mentor.profile?.education?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      let matchesSkill = true;
      if (this.selectedSkill && mentor.profile?.skills) {
        try {
          const skills = JSON.parse(mentor.profile.skills);
          matchesSkill = Array.isArray(skills) && skills.some((s: string) => 
            s.toLowerCase().includes(this.selectedSkill.toLowerCase())
          );
        } catch (e) {
          matchesSkill = mentor.profile.skills.toLowerCase().includes(this.selectedSkill.toLowerCase());
        }
      } else if (this.selectedSkill) {
        matchesSkill = false;
      }
      
      return matchesSearch && matchesSkill;
    });
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

  getResourceCount(mentor: Mentor): number {
    return mentor.resources?.length || 0;
  }

  viewMentorProfile(mentorId: string): void {
    this.router.navigate(['/mentorship/mentor', mentorId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
