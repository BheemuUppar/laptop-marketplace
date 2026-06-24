import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-product-card-carousel',
  templateUrl: './product-card-carousel.html',
  styleUrl: './product-card-carousel.scss',
})
export class ProductCardCarousel {
  images = input.required<string[]>();
  alt = input('Product');

  readonly index = signal(0);

  get hasMultiple(): boolean {
    return this.images().length > 1;
  }

  prev(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const len = this.images().length;
    this.index.update(i => (i - 1 + len) % len);
  }

  next(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const len = this.images().length;
    this.index.update(i => (i + 1) % len);
  }

  goTo(event: Event, i: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.index.set(i);
  }

  onTouchStart(event: TouchEvent): void {
    this.startX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const diff = this.startX - event.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    event.preventDefault();
    event.stopPropagation();
    diff > 0 ? this.index.update(i => (i + 1) % this.images().length) : this.index.update(i => (i - 1 + this.images().length) % this.images().length);
  }

  private startX = 0;
}
