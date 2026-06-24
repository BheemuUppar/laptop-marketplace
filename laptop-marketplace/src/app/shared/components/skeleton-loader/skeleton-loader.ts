import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss',
})
export class SkeletonLoader {
  type = input<'card' | 'list' | 'text'>('card');
  count = input(4);
}
