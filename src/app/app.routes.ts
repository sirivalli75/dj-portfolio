import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'gigs', 
    loadComponent: () => import('./pages/gigs/gigs.component').then(m => m.GigsComponent) 
  },
  { 
    path: 'listen', 
    loadComponent: () => import('./pages/listen/listen.component').then(m => m.ListenComponent) 
  },
  { 
    path: 'book', 
    loadComponent: () => import('./pages/book/book.component').then(m => m.BookComponent) 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];