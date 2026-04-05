import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionGhostComponent } from './session-ghost.component';

describe('SessionGhostComponent', () => {
  let component: SessionGhostComponent;
  let fixture: ComponentFixture<SessionGhostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionGhostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SessionGhostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
