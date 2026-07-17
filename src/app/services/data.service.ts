import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Track { 
  id: number; 
  created_at?: string;
  title: string; 
  platform: string; 
  embed_url: string; 
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase = inject(SupabaseService);

  async getAllGigs() {
    const { data } = await this.supabase.client.from('gigs').select('*').order('event_date', { ascending: true });
    return data || [];
  }

  async getAllTracks() {
    const { data } = await this.supabase.client.from('tracks').select('*').order('created_at', { ascending: false });
    return data || [];
  }

  async getAllEnquiries() {
    const { data } = await this.supabase.client.from('enquiries').select('*').order('created_at', { ascending: false });
    return data || [];
  }

  async createGig(gig: any) {
    const { error } = await this.supabase.client.from('gigs').insert([gig]);
    return !error;
  }

  async createTrack(track: any) {
    const { error } = await this.supabase.client.from('tracks').insert([track]);
    return !error;
  }

 // Inside data.service.ts
async submitEnquiry(enquiry: any) {
  // Return the entire object { data, error }
  return await this.supabase.client
    .from('enquiries')
    .insert([enquiry]);
}
}