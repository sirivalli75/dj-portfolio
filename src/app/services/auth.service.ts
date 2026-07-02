import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Guard import
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); // Inject platform context identity

  currentUser = signal<User | null>(null);

  constructor() {
    // Only execute session cookie checks if running natively on the client browser window
    if (isPlatformBrowser(this.platformId)) {
      this.supabase.client.auth.getSession().then(({ data: { session } }) => {
        this.currentUser.set(session?.user ?? null);
      });

      this.supabase.client.auth.onAuthStateChange((_event, session) => {
        this.currentUser.set(session?.user ?? null);
      });
    }
  }

  async loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    
    this.currentUser.set(data.user);
    return { success: true };
  }

  async logout(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}