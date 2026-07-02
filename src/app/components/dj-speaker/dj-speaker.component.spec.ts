import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DjSpeakerComponent } from './dj-speaker.component';

describe('DjSpeakerComponent', () => {
  let component: DjSpeakerComponent;
  let fixture: ComponentFixture<DjSpeakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DjSpeakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DjSpeakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
