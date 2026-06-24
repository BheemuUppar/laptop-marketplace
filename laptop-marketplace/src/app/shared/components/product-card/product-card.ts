import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { WhatsappService } from '../../../core/services/whatsapp';
import { ProductCardCarousel } from '../product-card-carousel/product-card-carousel';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, ProductCardCarousel],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();
  private readonly whatsapp = inject(WhatsappService);

  get displayPrice(): number {
    return this.product().sellingPrice;
  }

  get hasDiscount(): boolean {
    const p = this.product();
    return !!p.originalPrice && p.originalPrice > p.sellingPrice;
  }

  get stockLabel(): string {
    const p = this.product();
    switch (p.stockStatus) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return `Only ${p.quantityAvailable} Left`;
      case 'out_of_stock': return 'Out of Stock';
    }
  }

  get stockClass(): string {
    switch (this.product().stockStatus) {
      case 'in_stock': return 'badge-success';
      case 'low_stock': return 'badge-warning';
      case 'out_of_stock': return 'badge-danger';
    }
  }

  whatsappInquiry(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const p = this.product();
    this.whatsapp.openInquiry(`${p.brand} ${p.model}`, this.displayPrice);
  }
}
