import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private platformId = inject(PLATFORM_ID);

  isAdminAuthenticated = this.authService.currentUser;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  enquiriesList = signal<any[]>([]);
  isDataLoading = signal<boolean>(true);

  // Operation status flags [cite: 1808]
  gigSubmitSuccess = signal<boolean | null>(null);
  trackSubmitSuccess = signal<boolean | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  gigForm = this.fb.group({
    venue_name: ['', [Validators.required, Validators.minLength(3)]],
    location: ['', [Validators.required, Validators.minLength(4)]],
    event_date: ['', [Validators.required]],
    ticket_link: [''],
    is_upcoming: [true]
  });

  // Strictly validated form schema mapping to our Supabase database table [cite: 990, 1024]
  trackForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    platform: ['SoundCloud', [Validators.required]],
    embed_url: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.isAdminAuthenticated()) {
      this.loadDashboardData();
    }
  }
  

  async onLoginSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const result = await this.authService.loginWithEmail(
      this.loginForm.controls.email.value,
      this.loginForm.controls.password.value
    );

    if (result.success) {
      this.loginForm.reset();
      await this.loadDashboardData();
    } else {
      this.errorMessage.set(result.error ?? 'Invalid login credentials.');
    }
    this.isSubmitting.set(false);
  }

  async onGigSubmit(): Promise<void> {
    if (this.gigForm.invalid) {
      this.gigForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.gigSubmitSuccess.set(null);

    const formValues = this.gigForm.getRawValue();
    const cleanGig = {
      ...formValues,
      ticket_link: formValues.ticket_link.trim() === '' ? null : formValues.ticket_link
    };

    const isCreated = await this.dataService.createGig(cleanGig);
    if (isCreated) {
      this.gigSubmitSuccess.set(true);
      this.gigForm.reset({ is_upcoming: true });
    } else {
      this.gigSubmitSuccess.set(false);
    }
    this.isSubmitting.set(false);
  }

  // Processes new track form validations and uploads them to the cloud table [cite: 990]
  async onTrackSubmit(): Promise<void> {
    if (this.trackForm.invalid) {
      this.trackForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.trackSubmitSuccess.set(null);

    const isCreated = await this.dataService.createTrack(this.trackForm.getRawValue());
    if (isCreated) {
      this.trackSubmitSuccess.set(true);
      this.trackForm.reset({ platform: 'SoundCloud' });
    } else {
      this.trackSubmitSuccess.set(false);
    }
    this.isSubmitting.set(false);
  }

  async loadDashboardData(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      this.isDataLoading.set(true);
      const data = await this.dataService.getAllEnquiries();
      this.enquiriesList.set(data);
      this.isDataLoading.set(false);
    }
  }

  async onSignOut(): Promise<void> {
    await this.authService.logout();
    this.enquiriesList.set([]);
  }
}