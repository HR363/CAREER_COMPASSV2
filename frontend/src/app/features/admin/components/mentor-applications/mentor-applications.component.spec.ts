import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorApplicationsComponent } from './mentor-applications.component';

describe('MentorApplicationsComponent', () => {
  let component: MentorApplicationsComponent;
  let fixture: ComponentFixture<MentorApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorApplicationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MentorApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
