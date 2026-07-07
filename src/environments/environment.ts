export interface Environment {
  production: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  social: {
    instagram: string;
    email: string;
    soundcloud: string;
  };
}
export const environment = {
  production: false,
  supabaseUrl: 'https://rfievtrhvbkfwbvjidkg.supabase.co', // This is your real cloud URL!
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaWV2dHJodmJrZndidmppZGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NzY1NjEsImV4cCI6MjA5NzQ1MjU2MX0.uZc5YhNK8esqaDbU-Hnytps-zfNFhHqBuADDtj85KXw',   // Keep your long token string here on line 4
social: {
    instagram: 'https://www.instagram.com/aswin_gunasekaran_05?igsh=c3ZkNmxmbmY3M3Ez',
    email: 'mailto:aswinspark05@gmail.com?subject=Booking%20Inquiry&body=Hi%20Aswin,%20I%20would%20like%20to%20book%20you%20for%20an%20event.',
    soundcloud: 'https://soundcloud.com/your-handle'

  }
};
