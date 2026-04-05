import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
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

  // Tech icons for floating background
  private techIcons = ['⚡', '🎯', '💡', '🚀', '✨', '🔮', '💫', '🌟', '⭐', '🎓', '📊', '🤖', '💻', '🔑', '🎨'];
  
  features = [
    {
      icon: '🎯',
      title: 'AI-Powered Insights', 
      description: 'Leverage cutting-edge AI technology to discover career paths tailored to your unique skills and aspirations',
      gradient: 'from-purple-500 to-pink-500',
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

  stats = [
    { value: '10K+', label: 'Active Users', icon: '👥' },
    { value: '500+', label: 'Expert Mentors', icon: '🎓' },
    { value: '95%', label: 'Success Rate', icon: '⭐' },
    { value: '24/7', label: 'AI Support', icon: '🤖' }
  ];

  testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      avatar: '👩‍💻',
      content: 'CareerCompass helped me transition from teaching to tech. The AI recommendations were spot-on!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      avatar: '👨‍💼',
      content: 'The mentorship sessions were invaluable. I landed my dream job within 3 months!',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Data Scientist',
      avatar: '👩‍🔬',
      content: 'Best career platform I\'ve used. The learning paths are perfectly structured.',
      rating: 5
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

  private allArticles = [
    {
      title: 'The Future of AI in Software Development',
      excerpt: 'How artificial intelligence is reshaping the coding landscape and what you need to learn to stay ahead.',
      author: 'Dr. Sarah Chen',
      role: 'Staff Engineer at Google',
      date: 'Jan 15, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80',
      tags: ['AI', 'Career Growth']
    },
    {
      title: 'Mastering System Design Interviews',
      excerpt: 'A comprehensive guide to cracking the toughest section of technical interviews at top tech companies.',
      author: 'Michael Ross',
      role: 'Principal Architect',
      date: 'Jan 12, 2026',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
      tags: ['Interviews', 'System Design']
    },
    {
      title: 'Transitioning from Junior to Senior Dev',
      excerpt: 'Key soft skills and technical milestones you need to hit to reach the next level in your engineering career.',
      author: 'Emily Davis',
      role: 'Engineering Manager',
      date: 'Jan 10, 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      tags: ['Career Advice', 'Leadership']
    },
    {
      title: 'Remote Work: Strategies for Success',
      excerpt: 'Learn how to stay productive, maintain work-life balance, and advance your career while working from anywhere.',
      author: 'David Kim',
      role: 'Remote Work Advocate',
      date: 'Jan 05, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&auto=format&fit=crop&q=80',
      tags: ['Remote', 'Productivity']
    }
  ];

  tags = ['All', 'AI & Tech', 'Career Growth', 'Interviews', 'Leadership', 'Remote Work'];
  activeTag = 'All';

  get articles() {
    if (this.activeTag === 'All') return this.allArticles;
    
    return this.allArticles.filter(article => 
      article.tags.some(tag => {
        // Simple flexible matching
        const normalize = (s: string) => s.toLowerCase();
        const t = normalize(tag);
        const f = normalize(this.activeTag);
        return f.includes(t) || t.includes(f);
      })
    );
  }

  setActiveTag(tag: string) {
    this.activeTag = tag;
  }

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
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.observer) {
      this.observer.disconnect();
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
    this.updateJourneyProgress();
  }

  private updateJourneyProgress() {
    const journeySection = document.querySelector('.how-it-works') as HTMLElement;
    if (!journeySection) return;

    const rect = journeySection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionTop = rect.top;
    const sectionHeight = rect.height;

    // Calculate progress through the section (0 to 1)
    const startTrigger = windowHeight * 0.8; // Start when section is 80% visible
    const endTrigger = -sectionHeight * 0.5; // End halfway through section scroll
    
    if (sectionTop <= startTrigger && sectionTop >= endTrigger) {
      const totalScroll = startTrigger - endTrigger;
      const currentScroll = startTrigger - sectionTop;
      this.stepsProgress = Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100));
      
      // Determine active step based on progress
      if (this.stepsProgress < 33) {
        this.activeStep = 0;
      } else if (this.stepsProgress < 66) {
        this.activeStep = 1;
      } else {
        this.activeStep = 2;
      }
    } else if (sectionTop > startTrigger) {
      this.stepsProgress = 0;
      this.activeStep = 0;
    } else {
      this.stepsProgress = 100;
      this.activeStep = 2;
    }
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
        size: 16 + Math.random() * 24,
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
