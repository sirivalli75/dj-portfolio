import { TestBed } from '@angular/core/testing';

import { AudioSynthService } from './audio-synth.service';

describe('AudioSynthService', () => {
  let service: AudioSynthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioSynthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
