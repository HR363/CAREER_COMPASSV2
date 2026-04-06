import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FloatingIcon {
  icon: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('journeySection') journeySection?: ElementRef<HTMLElement>;
  @ViewChild('journeyViewport') journeyViewport?: ElementRef<HTMLDivElement>;
  @ViewChild('journeyRail') journeyRail?: ElementRef<HTMLDivElement>;

  // Mouse tracking
  mouseX = 0;
  mouseY = 0;
  cursorX = 0;
  cursorY = 0;
  
  // Scroll position
  scrollY = 0;
  
  // Floating icons for background
  floatingIcons: FloatingIcon[] = [];
  
  // Journey steps tracking
  activeStep = 0;
  stepsProgress = 0;
  journeyTranslate = 0;
  journeyScrollSpan = 0;
  journeySectionHeight = 1200;
  
  // Journey steps data
  journeySteps = [
    {
      number: '01',
      icon: '📝',
      title: 'Create Your Profile',
      description: 'Tell us about your skills, experience, and career aspirations. Our AI will start building your personalized roadmap.',
      details: ['Skills assessment', 'Interest mapping', 'Goal setting'],
      graphic: 'profile'
    },
    {
      number: '02',
      icon: '🤖',
      title: 'Get AI Recommendations',
      description: 'Receive intelligent career path suggestions based on market trends, your strengths, and growth potential.',
      details: ['Career matching', 'Learning paths', 'Salary insights'],
      graphic: 'ai'
    },
    {
      number: '03',
      icon: '🎯',
      title: 'Connect & Grow',
      description: 'Book sessions with industry mentors, track your progress, and transform your career journey.',
      details: ['Expert mentorship', 'Progress tracking', 'Community access'],
      graphic: 'connect'
    }
  ];
  
  // Animation frame ID
  private animationFrameId: number | null = null;
  private observer: IntersectionObserver | null = null;
  private wheelLockHandler?: (event: WheelEvent) => void;
  private isWheelLockActive = false;

  // Neural constellation glyphs for floating background
  private techIcons = [
    'o---o',
    'o--o--o',
    'o-+-o',
    'o\\|/o',
    'o/|\\o',
    'o<>o',
    'o==o',
    'o...o',
    '*-o-*',
    'o->o',
    'o<-o',
    'o-x-o',
    'o~o~o',
    'o:o:o',
    'o_o_o'
  ];
  
  features = [
    {
      icon: '🎯',
      title: 'AI-Powered Insights', 
      description: 'Leverage cutting-edge AI technology to discover career paths tailored to your unique skills and aspirations',
      gradient: 'from-green-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80'
    },
    {
      icon: '📚',
      title: 'Personalized Learning',
      description: 'Access curated learning roadmaps designed by industry experts to accelerate your professional growth',
      gradient: 'from-blue-500 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'
    },
    {
      icon: '👥',
      title: 'Expert Mentorship',
      description: 'Connect face-to-face with seasoned professionals through our integrated video platform',
      gradient: 'from-green-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80'
    },
    {
      icon: '💬',
      title: 'Smart AI Assistant',
      description: 'Get instant, intelligent answers to your career questions anytime, anywhere',
      gradient: 'from-orange-500 to-red-500',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80'
    }
  ];

  faqs = [
    {
      question: 'How does the AI career recommendation work?',
      answer: 'Our AI analyzes your skills, interests, and background against millions of career data points to suggest paths where you are most likely to succeed and find fulfillment.',
      isOpen: false
    },
    {
      question: 'Can I switch mentors if I need a different perspective?',
      answer: 'Absolutely! You can browse our network of over 500+ expert mentors and schedule sessions with anyone who matches your current learning goals.',
      isOpen: false
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes, we offer a 14-day free trial with full access to all features, including AI insights and one mentorship session.',
      isOpen: false
    },
    {
      question: 'Do you offer certificates upon completion?',
      answer: 'Yes, all our learning paths come with industry-recognized certificates that you can share on your LinkedIn profile and resume.',
      isOpen: false
    }
  ];

  partners = ['Google', 'Microsoft', 'Amazon', 'Tesla', 'Netflix', 'Meta'];

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  ngOnInit() {
    this.generateFloatingIcons();
    this.startAnimation();
  }

  ngAfterViewInit() {
    this.setupScrollObserver();
    setTimeout(() => {
      this.syncJourneyMeasurements();
      this.updateJourneyProgress();
    }, 0);

    // Use a non-passive listener so we can prevent default wheel scrolling during horizontal lock.
    this.wheelLockHandler = (event: WheelEvent) => this.handleJourneyWheel(event);
    window.addEventListener('wheel', this.wheelLockHandler, { passive: false });
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.wheelLockHandler) {
      window.removeEventListener('wheel', this.wheelLockHandler);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrollY = window.scrollY;
    if (this.isWheelLockActive) return;
    this.updateJourneyProgress();
  }

  @HostListener('window:resize')
  onResize() {
    this.syncJourneyMeasurements();
    this.updateJourneyProgress();
  }

  private updateJourneyProgress() {
    if (this.journeyScrollSpan <= 0) {
      this.syncJourneyMeasurements();
    }

    const section = this.journeySection?.nativeElement;
    if (!section || this.journeyScrollSpan <= 0) {
      this.journeyTranslate = 0;
      this.stepsProgress = 0;
      this.activeStep = 0;
      return;
    }

    const stickyTop = window.innerHeight * 0.12;
    const sectionTopOnPage = window.scrollY + section.getBoundingClientRect().top;
    const startY = sectionTopOnPage - stickyTop;
    const travel = window.scrollY - startY;
    const clampedTravel = Math.min(this.journeyScrollSpan, Math.max(0, travel));
    const ratio = Math.min(1, Math.max(0, clampedTravel / this.journeyScrollSpan));

    this.journeyTranslate = ratio * this.journeyScrollSpan;
    this.stepsProgress = ratio * 100;

    const maxIndex = this.journeySteps.length - 1;
    this.activeStep = Math.min(maxIndex, Math.max(0, Math.round(ratio * maxIndex)));
  }

  private syncJourneyMeasurements() {
    const viewport = this.journeyViewport?.nativeElement;
    const rail = this.journeyRail?.nativeElement;
    if (!viewport || !rail) return;

    const maxTranslate = Math.max(0, rail.scrollWidth - viewport.clientWidth);
    this.journeyScrollSpan = maxTranslate;
    this.journeySectionHeight = window.innerHeight + maxTranslate + window.innerHeight * 0.45;
  }

  private getJourneyLockRange(): { startY: number; endY: number } | null {
    const section = this.journeySection?.nativeElement;
    if (!section || this.journeyScrollSpan <= 0) return null;

    const stickyTop = window.innerHeight * 0.12;
    const sectionTopOnPage = window.scrollY + section.getBoundingClientRect().top;
    const startY = sectionTopOnPage - stickyTop;
    const endY = startY + this.journeyScrollSpan;
    return { startY, endY };
  }

  private handleJourneyWheel(event: WheelEvent) {
    const range = this.getJourneyLockRange();
    if (!range) return;

    const primaryDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (primaryDelta === 0) return;

    const currentY = window.scrollY;

    const enteringFromTop =
      primaryDelta > 0 && currentY < range.startY && currentY + primaryDelta >= range.startY;
    const enteringFromBottom =
      primaryDelta < 0 && currentY > range.endY && currentY + primaryDelta <= range.endY;

    if (enteringFromTop) {
      event.preventDefault();
      this.isWheelLockActive = true;
      this.applyJourneyTranslate(0);
      window.scrollTo({ top: range.startY, behavior: 'auto' });
      return;
    }

    if (enteringFromBottom) {
      event.preventDefault();
      this.isWheelLockActive = true;
      this.applyJourneyTranslate(this.journeyScrollSpan);
      window.scrollTo({ top: range.endY, behavior: 'auto' });
      return;
    }

    const atEndAndMovingDown = this.journeyTranslate >= this.journeyScrollSpan - 0.5 && primaryDelta > 0;
    const atStartAndMovingUp = this.journeyTranslate <= 0.5 && primaryDelta < 0;
    if (atEndAndMovingDown || atStartAndMovingUp) {
      this.isWheelLockActive = false;
      return;
    }

    const inLockRange = currentY >= range.startY && currentY <= range.endY;
    if (!inLockRange) return;

    const nextTranslate = Math.min(this.journeyScrollSpan, Math.max(0, this.journeyTranslate + primaryDelta));
    const reachedStart = nextTranslate <= 0;
    const reachedEnd = nextTranslate >= this.journeyScrollSpan;

    // Keep vertical position frozen while translating the horizontal rail.
    if ((primaryDelta > 0 && !reachedEnd) || (primaryDelta < 0 && !reachedStart)) {
      event.preventDefault();
      this.isWheelLockActive = true;
      this.applyJourneyTranslate(nextTranslate);
      window.scrollTo({ top: currentY, behavior: 'auto' });
      return;
    }

    // Clamp to the edge and release lock so natural vertical scroll resumes.
    if (primaryDelta > 0 && reachedEnd) {
      event.preventDefault();
      this.applyJourneyTranslate(this.journeyScrollSpan);
      this.isWheelLockActive = false;
      window.scrollTo({ top: range.endY + 1, behavior: 'auto' });
      return;
    }

    if (primaryDelta < 0 && reachedStart) {
      event.preventDefault();
      this.applyJourneyTranslate(0);
      this.isWheelLockActive = false;
      window.scrollTo({ top: Math.max(0, range.startY - 1), behavior: 'auto' });
      return;
    }
  }

  private applyJourneyTranslate(translate: number) {
    const clamped = Math.min(this.journeyScrollSpan, Math.max(0, translate));
    this.journeyTranslate = clamped;
    const ratio = this.journeyScrollSpan > 0 ? clamped / this.journeyScrollSpan : 0;
    this.stepsProgress = ratio * 100;
    const maxIndex = this.journeySteps.length - 1;
    this.activeStep = Math.min(maxIndex, Math.max(0, Math.round(ratio * maxIndex)));
  }

  isStepActive(index: number): boolean {
    return index <= this.activeStep;
  }

  isStepCurrent(index: number): boolean {
    return index === this.activeStep;
  }

  private generateFloatingIcons() {
    this.floatingIcons = [];
    for (let i = 0; i < 20; i++) {
      this.floatingIcons.push({
        icon: this.techIcons[Math.floor(Math.random() * this.techIcons.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 15 + Math.random() * 14,
        speed: 0.5 + Math.random() * 1.5,
        delay: Math.random() * 5,
        opacity: 0.03 + Math.random() * 0.08
      });
    }
  }

  private startAnimation() {
    const animate = () => {
      // Smooth cursor following
      this.cursorX += (this.mouseX - this.cursorX) * 0.08;
      this.cursorY += (this.mouseY - this.cursorY) * 0.08;
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private setupScrollObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all animated elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      this.observer?.observe(el);
    });
  }

  // Get parallax transform based on scroll
  getParallaxStyle(speed: number = 0.5) {
    return {
      transform: `translateY(${this.scrollY * speed}px)`
    };
  }

  // Get 3D card transform based on mouse position
  getCardTransform(event: MouseEvent, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  resetCardTransform() {
    return 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }
}

