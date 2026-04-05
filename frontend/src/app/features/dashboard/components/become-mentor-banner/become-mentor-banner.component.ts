import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-become-mentor-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './become-mentor-banner.component.html',
  styleUrls: ['./become-mentor-banner.component.scss']
})
export class BecomeMentorBannerComponent implements OnInit, OnDestroy {
  @Output() applyClicked = new EventEmitter<void>();
  
  currentSlide = 0;
  slideCount = 5;
  autoPlayInterval: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 6000); // Change slide every 6 seconds
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slideCount;
  }

  setSlide(index: number) {
    this.currentSlide = index;
    // Reset timer when manually clicked
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  onApplyClick() {
    this.applyClicked.emit();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}

