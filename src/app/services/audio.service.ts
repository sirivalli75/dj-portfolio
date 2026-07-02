import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  // Global signals shared by Home and Listen
  currentTrack = signal<{ title: string; embed_url: string } | null>(null);
  isPlaying = signal<boolean>(false);
  
  private audio = new Audio();

  constructor() {
    this.audio.onended = () => this.isPlaying.set(false);
  }

  playTrack(track: { title: string; embed_url: string }) {
    if (this.currentTrack()?.embed_url === track.embed_url) {
      this.toggle();
      return;
    }
    this.currentTrack.set(track);
    this.audio.src = track.embed_url;
    this.audio.play();
    this.isPlaying.set(true);
  }

  toggle() {
    if (!this.audio.src) return;
    this.isPlaying() ? this.audio.pause() : this.audio.play();
    this.isPlaying.update(v => !v);
  }
}