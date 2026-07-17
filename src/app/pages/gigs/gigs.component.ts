import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common'; // Injected platform utilities
import { DataService } from '../../services/data.service';
import { DjDeckComponent } from '../../components/dj-deck/dj-deck.component';

export interface Gig {
  id: number;
  venue_name: string;
  location: string;
  event_date: string;
  ticket_link: string | null;
  is_upcoming: boolean;
}

@Component({
  selector: 'app-gigs',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './gigs.component.html',
  styleUrl: './gigs.component.css'
})
export class GigsComponent implements OnInit {
  private dataService = inject(DataService);
  private platformId = inject(PLATFORM_ID); // Identifies if app is on server or browser context

  gigsList = signal<Gig[]>([]);
  isLoading = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    // Only fetch live database items if running natively in the client's web browser
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Fetch live records directly from your Supabase table
        const dynamicGigs = await this.dataService.getAllGigs();
        this.gigsList.set(dynamicGigs);
      } catch (error) {
        console.error('Failed to resolve database stream:', error);
      } finally {
        // Drop the loading spinner layout state
        this.isLoading.set(false);
      }
    } else {
      // Quietly bypass fetching on the server-side build phase to avoid the 30s timeout
      this.isLoading.set(false);
    }
  }
}