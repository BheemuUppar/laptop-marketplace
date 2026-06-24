import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { InquiryService } from '../../../core/services/inquiry';
import { ReviewService } from '../../../core/services/review';
import { SeoService } from '../../../core/services/seo';
import { ReviewStats } from '../../../core/models/review.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly inquiryService = inject(InquiryService);
  private readonly reviewService = inject(ReviewService);
  private readonly seo = inject(SeoService);

  readonly totalProducts = this.productService.totalProducts;
  readonly availableProducts = this.productService.availableProducts;
  readonly lowStockProducts = this.productService.lowStockProducts;
  readonly outOfStockProducts = this.productService.outOfStockProducts;
  readonly totalInquiries = this.inquiryService.totalInquiries;
  readonly newInquiries = this.inquiryService.newInquiries;

  readonly reviewStats = signal<ReviewStats>({ total: 0, visible: 0, featured: 0, hidden: 0 });

  ngOnInit(): void {
    this.seo.update({ title: 'Admin Dashboard', description: 'iPro Technologies admin dashboard' });
    this.productService.refreshStats().subscribe();
    this.inquiryService.refreshStats().subscribe();
    this.reviewService.getStats().subscribe({
      next: stats => this.reviewStats.set(stats),
      error: () => {},
    });
  }
}
