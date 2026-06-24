import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product';
import { WhatsappService } from '../../core/services/whatsapp';
import { SeoService } from '../../core/services/seo';
import { Product } from '../../core/models/product.model';
import { STORE_INFO } from '../../core/constants/store.constants';
import { ImageGallery } from '../../shared/components/image-gallery/image-gallery';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { SkeletonLoader } from '../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CurrencyPipe, ImageGallery, ProductCard, SkeletonLoader, EmptyState],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  readonly store = STORE_INFO;
  readonly product = signal<Product | null>(null);
  readonly relatedProducts = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) return;
      this.loadProduct(slug);
    });
  }

  get displayPrice(): number {
    return this.product()?.sellingPrice ?? 0;
  }

  get hasDiscount(): boolean {
    const p = this.product();
    return !!p?.originalPrice && p.originalPrice > p.sellingPrice;
  }

  get stockLabel(): string {
    const p = this.product();
    if (!p) return '';
    switch (p.stockStatus) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return `Only ${p.quantityAvailable} Left`;
      case 'out_of_stock': return 'Out of Stock';
    }
  }

  get stockClass(): string {
    const p = this.product();
    if (!p) return '';
    switch (p.stockStatus) {
      case 'in_stock': return 'badge-success';
      case 'low_stock': return 'badge-warning';
      case 'out_of_stock': return 'badge-danger';
    }
  }

  whatsappInquiry(): void {
    const p = this.product();
    if (!p) return;
    this.whatsapp.openInquiry(`${p.brand} ${p.model}`, this.displayPrice);
  }

  callStore(): void {
    window.open(`tel:+91${this.store.phones[0]}`, '_self');
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.productService.getBySlug(slug).subscribe(product => {
      if (!product) {
        this.notFound.set(true);
        this.loading.set(false);
        return;
      }
      this.product.set(product);
      this.seo.update({
        title: `${product.brand} ${product.model} - iPro Technologies`,
        description: product.description,
        keywords: `${product.brand}, ${product.model}, used laptop, HSR Layout`,
        image: product.images[0],
      });
      this.productService.getRelated(product.id).subscribe(related => {
        this.relatedProducts.set(related);
        this.loading.set(false);
      });
    });
  }
}
