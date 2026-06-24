import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STORE_INFO } from '../../../core/constants/store.constants';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly store = STORE_INFO;
  readonly currentYear = new Date().getFullYear();

  readonly quickLinks = [
    { label: 'Browse Laptops', path: '/laptops' },
    { label: 'Brands', path: '/brands' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Store Location', path: '/store-location' },
  ];
}
