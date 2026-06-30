import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly auth = inject(AuthService);

  readonly navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Products', path: '/admin/products', icon: 'inventory_2' },
    { label: 'Inventory', path: '/admin/inventory', icon: 'warehouse' },
    { label: 'Inquiries', path: '/admin/inquiries', icon: 'contact_mail' },
    { label: 'Reviews', path: '/admin/reviews', icon: 'rate_review' },
    { label: 'Gallery', path: '/admin/gallery', icon: 'photo_library' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
