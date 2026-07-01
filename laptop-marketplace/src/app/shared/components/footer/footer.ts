import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STORE_INFO } from '../../../core/constants/store.constants';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly auth = inject(AuthService);

  readonly store = STORE_INFO;
  readonly currentYear = new Date().getFullYear();

  readonly adminPath = computed(() =>
    this.auth.hasValidSession() ? '/admin/dashboard' : '/admin/login'
  );
  readonly adminLabel = computed(() =>
    this.auth.hasValidSession() ? 'Admin Dashboard' : 'Admin Login'
  );

  readonly quickLinks = [
    { label: 'Browse Laptops', path: '/laptops' },
    { label: 'Brands', path: '/brands' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Store Location', path: '/store-location' },
  ];
}
