import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly themeService = inject(ThemeService);
  readonly auth = inject(AuthService);
  readonly mobileMenuOpen = signal(false);
  readonly isDark = this.themeService.theme;

  readonly adminPath = computed(() =>
    this.auth.hasValidSession() ? '/admin/dashboard' : '/admin/login'
  );
  readonly adminLabel = computed(() =>
    this.auth.hasValidSession() ? 'Admin Dashboard' : 'Admin Login'
  );

  readonly navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Laptops', path: '/laptops' },
    { label: 'Brands', path: '/brands' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  toggleMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
