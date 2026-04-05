import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorPerformanceComponent } from './mentor-performance.component';

describe('MentorPerformanceComponent', () => {
  let component: MentorPerformanceComponent;
  let fixture: ComponentFixture<MentorPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorPerformanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MentorPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
