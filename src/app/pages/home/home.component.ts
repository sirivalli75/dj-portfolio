import { Component, signal, computed, inject, OnInit, PLATFORM_ID, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, NgStyle, isPlatformBrowser, DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService, Track } from '../../services/data.service';
import { DjDeckComponent } from "../../components/dj-deck/dj-deck.component";
import { DjSpeakerComponent } from '../../components/dj-speaker/dj-speaker.component';
import { AudioService } from '../../services/audio.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface Gig {
  id: number;
  venue_name: string;
  location: string;
  event_date: string;
  ticket_link: string | null;
  is_upcoming: boolean;
  image_url?: string;
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgClass, NgStyle, ReactiveFormsModule, DatePipe, DjDeckComponent, DjSpeakerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private dataService = inject(DataService);
  private fb = inject(NonNullableFormBuilder);
  private platformId = inject(PLATFORM_ID);
  private audioService = inject(AudioService);
  private sanitizer = inject(DomSanitizer);
 socialLinks = environment.social;

  scrollY = signal<number>(0);
  
  uploadedMixes = signal<Track[]>([]);
  gigsList = signal<Gig[]>([]);
  selectedTrackIndex = signal<number>(0);
  audioElement: HTMLAudioElement | null = null;

  isSubmitting = signal<boolean>(false);
  formSuccess = signal<boolean>(false);
  formError = signal<string | null>(null);

  activeHoveredSocial = signal<string | null>(null);
  activeZoomingSocial = signal<string | null>(null);

  bookingForm = this.fb.group({
    client_name: ['', [Validators.required]],
    client_email: ['', [Validators.required, Validators.email]],
    event_date: ['', [Validators.required]],
    event_details: ['', [Validators.minLength(1)]]
  });

  simulatedFrequencies = signal<number[]>(Array(36).fill(12));

 currentTrackTitle = computed(() => this.audioService.currentTrack()?.title || 'NO TRACK LOADED');
isPlaying = this.audioService.isPlaying;



  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollY.set(window.scrollY);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllContentFromCloud();
      this.startVisualizerSimulation();
    }
  }
  scrollToTop(): void {
  if (isPlatformBrowser(this.platformId)) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  // High-impact drum kick for socials
  playDrumSound(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio drum error:', e);
    }
  }

  playDiscoSynth(type: 'thump' | 'sweep' | 'click'): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'thump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
        gainNode.gain.setValueAtTime(0.35, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.22);
        osc.start(now); osc.stop(now + 0.22);
      } else if (type === 'sweep') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.35);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.start(now); osc.stop(now + 0.35);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100, now);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.03);
        osc.start(now); osc.stop(now + 0.03);
      }
    } catch (e) { console.warn('Audio Context block:', e); }
  }

  async loadAllContentFromCloud(): Promise<void> {
    try {
      const [cloudTracks, cloudGigs] = await Promise.all([
        this.dataService.getAllTracks(),
        this.dataService.getAllGigs()
      ]);

      if (cloudTracks && cloudTracks.length > 0) {
        this.uploadedMixes.set(cloudTracks);
        this.initializeAudioEngine(cloudTracks[0].embed_url);
      } else {
        const fallbackTracks = [
          { id: 1, title: 'DISCO GLOW REVOLUTION // ARENA LIVE MIX', embed_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', platform: 'Supabase' },
          { id: 2, title: 'RETRO FUNK WAREHOUSE RESIDENCY SHUTDOWN', embed_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', platform: 'Supabase' }
        ];
        this.uploadedMixes.set(fallbackTracks);
        this.initializeAudioEngine(fallbackTracks[0].embed_url);
      }

      if (cloudGigs && cloudGigs.length > 0) {
        this.gigsList.set(cloudGigs.map((g, i) => ({
          ...g,
          image_url: i % 2 === 0 ? 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80'
        })));
       
      }
    } catch (err) { console.error('Data pipeline error:', err); }
  }

  initializeAudioEngine(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.audioElement) this.audioElement.pause();
    this.audioElement = new Audio(url);
    this.audioElement.loop = true;
  }

  togglePlayback(): void {
    this.audioService.toggle();
    this.playDiscoSynth('sweep');
    
  }
 
// Add this inside HomeComponent class in home.component.ts
openInNewTab(url: string): void {
  // Opens the actual SoundCloud link in a new tab, bypassing iframe blocking
  window.open(url, '_blank', 'noopener,noreferrer');
}
  nextTrack(): void {
    if (this.uploadedMixes().length <= 1) return;
    this.playDiscoSynth('click');
    const nextIndex = (this.selectedTrackIndex() + 1) % this.uploadedMixes().length;
    this.selectedTrackIndex.set(nextIndex);
    this.initializeAudioEngine(this.uploadedMixes()[nextIndex].embed_url);
    if (this.isPlaying() && this.audioElement) this.audioElement.play().catch(() => this.isPlaying.set(false));
  }
  isCopied = signal<boolean>(false);

  // 3. Add this function to handle the clipboard logic
  copyEmailToClipboard(email: string): void {
    // We strip 'mailto:' if it exists in the environment variable
    const cleanEmail = email.replace('mailto:', '').split('?')[0];
    
    navigator.clipboard.writeText(cleanEmail).then(() => {
      this.isCopied.set(true);
      // Reset the message after 2 seconds
      setTimeout(() => this.isCopied.set(false), 2000);
    }).catch(err => console.error('Could not copy email: ', err));
  }
  

  executeSocialRedirect(platform: string, destinationUrl: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.playDrumSound(); // Updated to drum kick
    this.activeZoomingSocial.set(platform);
   setTimeout(() => {
    if (platform === 'email') {
      // For email, we don't use window.open. 
      // We set window.location.href to trigger the mailto protocol.
      window.location.href = destinationUrl;
    } else {
      // For Instagram/Soundcloud, use window.open
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    }
    
    this.activeZoomingSocial.set(null);
  }, 450);
  }
async onBookingSubmit(): Promise<void> {
  if (this.bookingForm.invalid) {
    this.bookingForm.markAllAsTouched();
    return;
  }

  this.isSubmitting.set(true);
  this.formError.set(null); // Reset error state
  this.playDiscoSynth('click');

  try {
    const response = await this.dataService.submitEnquiry(this.bookingForm.getRawValue());

    if (response.error) {
      // Set the error message if something went wrong
      this.formError.set("Transmission Error: " + response.error.message);
      return; 
    }
    try {
      await fetch('https://rfievtrhvbkfwbvjidkg.supabase.co/functions/v1/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.bookingForm.getRawValue())
      });
     
    } catch (emailErr) {
      console.error("Email trigger failed:", emailErr);
      // We don't block formSuccess because the DB data is already safe
    }
    

    this.formSuccess.set(true);
    this.bookingForm.reset();
    setTimeout(() => this.formSuccess.set(false), 4000);

  } catch (err) {
    this.formError.set("Critical system error. Please try again later.");
  } finally {
    this.isSubmitting.set(false);
  }
}
 private startVisualizerSimulation(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setInterval(() => {
      if (this.isPlaying()) {
        this.simulatedFrequencies.set(Array(36).fill(0).map(() => Math.floor(Math.random() * 45) + 12));
        if (Math.random() > 0.88) this.playDiscoSynth('thump');
      } else {
        this.simulatedFrequencies.set(Array(36).fill(5));
      }
    }, 90);
  }

}