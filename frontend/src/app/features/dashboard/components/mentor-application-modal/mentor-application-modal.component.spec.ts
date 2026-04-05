import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorApplicationModalComponent } from './mentor-application-modal.component';

describe('MentorApplicationModalComponent', () => {
  let component: MentorApplicationModalComponent;
  let fixture: ComponentFixture<MentorApplicationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorApplicationModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MentorApplicationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
