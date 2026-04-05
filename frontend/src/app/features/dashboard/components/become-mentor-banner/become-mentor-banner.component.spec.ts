import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecomeMentorBannerComponent } from './become-mentor-banner.component';

describe('BecomeMentorBannerComponent', () => {
  let component: BecomeMentorBannerComponent;
  let fixture: ComponentFixture<BecomeMentorBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BecomeMentorBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BecomeMentorBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
