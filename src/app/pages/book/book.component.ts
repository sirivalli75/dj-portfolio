import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Injected platform checker
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './book.component.html',
  styleUrl: './book.component.css'
})
export class BookComponent {
  private fb = inject(NonNullableFormBuilder);
  private dataService = inject(DataService);
  private platformId = inject(PLATFORM_ID); // Tracks Server vs Browser runtime context

  submitSuccess = signal<boolean | null>(null);
  isSubmitting = signal<boolean>(false);
 
  

  bookingForm = this.fb.group({
    client_name: ['', [Validators.required, Validators.minLength(2)]],
    client_email: ['', [Validators.required, Validators.email]],
    event_date: ['', [Validators.required]],
    event_details: ['', [Validators.minLength(1)]]
  });
getToday(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  async onFormSubmit(): Promise<void> {
    // Enforce form validation checks strictly in the client browser context
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitSuccess.set(null);

    const isSaved = await this.dataService.submitEnquiry(this.bookingForm.getRawValue());
    
    if (isSaved) {
     // 2. Trigger Email Notification
      try {
        await fetch('https://rfievtrhvbkfwbvjidkg.supabase.co/functions/v1/send-booking-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.bookingForm.getRawValue())
        });
      } catch (err) {
        console.error("Email trigger failed:", err);
      }

      this.submitSuccess.set(true);
      this.bookingForm.reset();
      // Auto-hide the success message after 4 seconds
      setTimeout(() => this.submitSuccess.set(null), 4000);
    } else {
      this.submitSuccess.set(false);
      setTimeout(() => this.submitSuccess.set(null), 4000);
    }
    this.isSubmitting.set(false);
  }
}