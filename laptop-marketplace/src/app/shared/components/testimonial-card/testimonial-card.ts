import { Component, input } from '@angular/core';
import { Review } from '../../../core/models/review.model';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-testimonial-card',
  imports: [StarRating],
  templateUrl: './testimonial-card.html',
  styleUrl: './testimonial-card.scss',
})
export class TestimonialCard {
  review = input.required<Review>();

  get initials(): string {
    return this.review().customerName.charAt(0).toUpperCase();
  }

  get subtitle(): string {
    const parts = [this.review().customerRole, this.review().customerCompany].filter(Boolean);
    return parts.join(' · ');
  }
}
