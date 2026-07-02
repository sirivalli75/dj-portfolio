import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // Core platform guard utility
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID); // Detects Server vs. Browser runtime context

  // If executing on Node.js Server pre-rendering, let it pass smoothly to avoid timeout loops
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // If running in the client browser container, enforce real profile checks
  if (authService.currentUser()) {
    return true;
  }

  // Block access and bounce unauthenticated browser users back to the landing page
  router.navigate(['/']);
  return false;
};