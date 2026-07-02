import { Component, OnInit, signal, inject } from '@angular/core';
import { DataService, Track } from '../../services/data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-listen',
  standalone: true,
  templateUrl: './listen.component.html'
})
export class ListenComponent implements OnInit {
  private dataService = inject(DataService);
  private sanitizer = inject(DomSanitizer);
  private audioService = inject(AudioService);
  
  uploadedMixes = signal<Track[]>([]);
  isLoading = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    const tracks = await this.dataService.getAllTracks();
    this.uploadedMixes.set(tracks);
    this.isLoading.set(false);
  }
  // ... inside your ListenComponent class
playFromListen(track: Track) {
  // This updates the service, which HomeComponent will react to
  this.audioService.playTrack({ title: track.title, embed_url: track.embed_url });
}
playTrack(track: Track): void {
    this.audioService.playTrack({ 
      title: track.title, 
      embed_url: track.embed_url 
    });
    window.open(track.embed_url, '_self');
  }
  getSafeEmbedUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}