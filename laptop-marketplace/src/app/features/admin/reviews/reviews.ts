import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReviewService } from '../../../core/services/review';
import { SeoService } from '../../../core/services/seo';
import { Review } from '../../../core/models/review.model';
import { StarRating } from '../../../shared/components/star-rating/star-rating';

@Component({
  selector: 'app-admin-reviews',
  imports: [RouterLink, DatePipe, StarRating],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class AdminReviews implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly seo = inject(SeoService);

  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly searchQuery = signal('');

  ngOnInit(): void {
    this.seo.update({ title: 'Manage Reviews - Admin', description: 'Manage customer testimonials' });
    this.loadReviews();
  }

  filteredReviews(): Review[] {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.reviews();
    return this.reviews().filter(review =>
      review.customerName.toLowerCase().includes(q) ||
      review.reviewText.toLowerCase().includes(q) ||
      (review.customerRole || '').toLowerCase().includes(q) ||
      (review.customerCompany || '').toLowerCase().includes(q)
    );
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  loadReviews(): void {
    this.loading.set(true);
    this.reviewService.getAllAdmin().subscribe({
      next: reviews => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleVisible(review: Review): void {
    this.reviewService.toggleVisibility(review.id, !review.isVisible).subscribe({
      next: updated => this.patchRow(updated),
    });
  }

  toggleFeatured(review: Review): void {
    this.reviewService.toggleFeatured(review.id, !review.isFeatured).subscribe({
      next: updated => this.patchRow(updated),
    });
  }

  deleteReview(review: Review): void {
    if (!confirm(`Delete review from ${review.customerName}?`)) return;
    this.reviewService.delete(review.id).subscribe({
      next: () => this.reviews.update(items => items.filter(r => r.id !== review.id)),
    });
  }

  private patchRow(updated: Review): void {
    this.reviews.update(items => items.map(r => (r.id === updated.id ? updated : r)));
  }
}
