import { Component, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRating {
  rating = input.required<number>();
  size = input<'sm' | 'md'>('sm');

  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
