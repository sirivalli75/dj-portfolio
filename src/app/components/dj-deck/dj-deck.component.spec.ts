import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DjDeckComponent } from './dj-deck.component';

describe('DjDeckComponent', () => {
  let component: DjDeckComponent;
  let fixture: ComponentFixture<DjDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DjDeckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DjDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
