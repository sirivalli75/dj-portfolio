import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private platformId = inject(PLATFORM_ID);
  public client!: SupabaseClient;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // BROWSER RUNTIME: Initialize full automated session and tracking
      this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
    } else {
      // NODE.JS SERVER RUNTIME: Disable background micro-tasks so SSR can finish instantly
      this.client = createClient(environment.supabaseUrl, environment.supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
    }
  }
}