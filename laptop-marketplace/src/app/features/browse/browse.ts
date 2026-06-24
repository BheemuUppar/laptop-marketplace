import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product';
import { SeoService } from '../../core/services/seo';
import { Product, ProductFilter } from '../../core/models/product.model';
import { FilterPanel } from '../../shared/components/filter-panel/filter-panel';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { SkeletonLoader } from '../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-browse',
  imports: [FilterPanel, ProductCard, SkeletonLoader, EmptyState],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
})
export class Browse implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly filter = signal<ProductFilter>({});

  ngOnInit(): void {
    this.seo.update({
      title: 'Browse Laptops',
      description: 'Browse current inventory at iPro Technologies, HSR Layout, Bengaluru.',
      keywords: 'used laptops HSR Layout, refurbished laptops Bengaluru, iPro Technologies',
    });

    this.route.queryParams.subscribe(params => {
      const brand = params['brand'] as string | undefined;
      this.filter.update(f => ({ ...f, brand: brand || f.brand }));
      this.loadProducts();
    });
  }

  onFilterChange(filter: ProductFilter): void {
    this.filter.set(filter);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { brand: filter.brand || null },
      queryParamsHandling: 'merge',
    });
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getAll(this.filter()).subscribe(products => {
      this.products.set(products);
      this.loading.set(false);
    });
  }
}
