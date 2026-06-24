import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../core/services/review';
import { SeoService } from '../../core/services/seo';
import { Review, ReviewSortOption } from '../../core/models/review.model';
import { TestimonialCard } from '../../shared/components/testimonial-card/testimonial-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { STORE_INFO } from '../../core/constants/store.constants';

@Component({
  selector: 'app-reviews',
  imports: [RouterLink, FormsModule, TestimonialCard, EmptyState],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class Reviews implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly seo = inject(SeoService);

  readonly store = STORE_INFO;
  readonly allReviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly searchQuery = signal('');
  readonly ratingFilter = signal<number | null>(null);
  readonly sortBy = signal<ReviewSortOption>('latest');

  readonly filteredReviews = computed(() => {
    let list = [...this.allReviews()];
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        r =>
          r.customerName.toLowerCase().includes(q) ||
          r.reviewText.toLowerCase().includes(q) ||
          (r.customerRole || '').toLowerCase().includes(q) ||
          (r.customerCompany || '').toLowerCase().includes(q),
      );
    }
    const rating = this.ratingFilter();
    if (rating) list = list.filter(r => r.rating === rating);

    switch (this.sortBy()) {
      case 'highest':
        return list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'lowest':
        return list.sort((a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  });

  ngOnInit(): void {
    this.seo.update({
      title: 'Customer Reviews - iPro Technologies',
      description: 'Read testimonials from customers who purchased refurbished laptops from iPro Technologies in HSR Layout.',
      keywords: 'iPro Technologies reviews, laptop store testimonials HSR Layout',
    });

    this.reviewService.getVisible().subscribe({
      next: reviews => {
        this.allReviews.set(reviews);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
