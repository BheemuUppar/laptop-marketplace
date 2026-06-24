import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Review } from '../../../core/models/review.model';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-review-card',
  imports: [DatePipe, StarRating],
  templateUrl: './review-card.html',
  styleUrl: './review-card.scss',
})
export class ReviewCard {
  review = input.required<Review>();
}
