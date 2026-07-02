import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
  // Using default OnPush strategy implicitly via Signals for better performance profile
})
export class NavbarComponent {
  // Signal to handle the mobile navigation toggle state
  isMobileMenuOpen = signal<boolean>(false);

  toggleMenu(): void {
    this.isMobileMenuOpen.update(state => !state);
  }

  closeMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}