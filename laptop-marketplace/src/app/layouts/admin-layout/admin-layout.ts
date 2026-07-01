import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { MasterService } from '../../core/services/master.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly masterService = inject(MasterService);

  readonly navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Products', path: '/admin/products', icon: 'inventory_2' },
    { label: 'Inventory', path: '/admin/inventory', icon: 'warehouse' },
    { label: 'Inquiries', path: '/admin/inquiries', icon: 'contact_mail' },
    { label: 'Reviews', path: '/admin/reviews', icon: 'rate_review' },
    { label: 'Gallery', path: '/admin/gallery', icon: 'photo_library' },
    { label: 'Masters', path: '/admin/masters', icon: 'tune' },
    { label: 'Account', path: '/admin/account', icon: 'manage_accounts' },
  ];

  ngOnInit(): void {
    if (!this.auth.hasValidSession()) {
      this.auth.rejectInvalidSession();
      return;
    }
    this.masterService.loadAll(true).subscribe();
  }

  logout(): void {
    this.auth.logout();
  }
}
