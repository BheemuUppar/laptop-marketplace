import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product';
import { SeoService } from '../../../core/services/seo';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-inventory',
  imports: [FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly seo = inject(SeoService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal(false);
  readonly quantityEdits = signal<Record<string, number>>({});

  readonly alertProducts = computed(() =>
    this.products().filter(p => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock')
  );

  readonly availableProducts = this.productService.availableProducts;
  readonly lowStockProducts = this.productService.lowStockProducts;
  readonly outOfStockProducts = this.productService.outOfStockProducts;

  ngOnInit(): void {
    this.seo.update({ title: 'Inventory Management', description: 'iPro Technologies inventory' });
    this.loadProducts();
    this.productService.refreshStats().subscribe();
  }

  getEditQuantity(product: Product): number {
    return this.quantityEdits()[product.id] ?? product.quantityAvailable;
  }

  setEditQuantity(id: string, value: string | number): void {
    const qty = Math.max(0, Math.floor(Number(value) || 0));
    this.quantityEdits.update(edits => ({ ...edits, [id]: qty }));
  }

  stockBadgeClass(status: string): string {
    switch (status) {
      case 'in_stock': return 'badge-success';
      case 'low_stock': return 'badge-warning';
      default: return 'badge-danger';
    }
  }

  stockLabel(status: string, qty: number): string {
    switch (status) {
      case 'in_stock': return `${qty} in stock`;
      case 'low_stock': return `Low stock (${qty})`;
      default: return 'Out of stock';
    }
  }

  hasPendingChanges(): boolean {
    return Object.keys(this.quantityEdits()).length > 0;
  }

  saveBulkUpdate(): void {
    const edits = this.quantityEdits();
    const updates = Object.entries(edits).map(([id, quantityAvailable]) =>
      this.productService.updateStock(id, quantityAvailable)
    );
    if (!updates.length) return;

    this.saving.set(true);
    this.error.set('');
    this.success.set(false);

    forkJoin(updates).subscribe({
      next: () => {
        this.quantityEdits.set({});
        this.saving.set(false);
        this.success.set(true);
        this.loadProducts();
        this.productService.refreshStats().subscribe();
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message || 'Failed to update stock. Please try again.');
      },
    });
  }

  resetEdits(): void {
    this.quantityEdits.set({});
    this.error.set('');
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllAdmin().subscribe(products => {
      this.products.set(products);
      this.loading.set(false);
    });
  }
}
