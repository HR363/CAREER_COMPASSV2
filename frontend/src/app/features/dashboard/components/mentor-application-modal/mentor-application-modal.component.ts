import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-mentor-application-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mentor-application-modal.component.html',
  styleUrl: './mentor-application-modal.component.scss'
})
export class MentorApplicationModalComponent {
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  applicationForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.applicationForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(20)]],
      resumeUrl: ['']
    });
  }

  close() {
    this.isOpen = false;
    this.closeEvent.emit();
    setTimeout(() => {
      this.resetForm();
    }, 300); // Allows animation to finish before reset
  }

  resetForm() {
    this.applicationForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = false;
  }

  onSubmit() {
    if (this.applicationForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    
    const { reason, resumeUrl } = this.applicationForm.value;

    this.profileService.applyAsMentor(reason, resumeUrl).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.successMessage = 'Application submitted successfully! Our team will review your profile.';
        // Optionally auto-close after a few seconds
        // setTimeout(() => this.close(), 3000);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Error applying', err);
        // Clean up NestJS array validation error if necessary
        const message = err.error?.message;
        this.errorMessage = Array.isArray(message) ? message[0] : (message || 'An error occurred while submitting.');
      }
    });
  }
}
