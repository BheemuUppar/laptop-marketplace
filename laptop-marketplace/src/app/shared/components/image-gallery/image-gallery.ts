import { Component, input, signal, HostListener, PLATFORM_ID, inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.scss',
})
export class ImageGallery implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  images = input.required<string[]>();
  alt = input('Product image');

  readonly selectedIndex = signal(0);
  readonly zoomed = signal(false);
  readonly fullscreen = signal(false);
  readonly touchStartX = signal(0);

  get hasMultiple(): boolean {
    return this.images().length > 1;
  }

  get counter(): string {
    return `${this.selectedIndex() + 1} / ${this.images().length}`;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.fullscreen()) return;
    if (event.key === 'Escape') this.closeFullscreen();
    if (event.key === 'ArrowLeft') this.prev();
    if (event.key === 'ArrowRight') this.next();
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  selectImage(index: number): void {
    this.selectedIndex.set(index);
    this.zoomed.set(false);
  }

  prev(): void {
    const len = this.images().length;
    if (len <= 1) return;
    this.selectedIndex.update(i => (i - 1 + len) % len);
    this.zoomed.set(false);
  }

  next(): void {
    const len = this.images().length;
    if (len <= 1) return;
    this.selectedIndex.update(i => (i + 1) % len);
    this.zoomed.set(false);
  }

  toggleZoom(event?: Event): void {
    event?.stopPropagation();
    this.zoomed.update(v => !v);
  }

  openFullscreen(event?: Event): void {
    event?.stopPropagation();
    this.fullscreen.set(true);
    this.lockScroll();
  }

  closeFullscreen(): void {
    this.fullscreen.set(false);
    this.zoomed.set(false);
    this.unlockScroll();
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX.set(event.touches[0].clientX);
  }

  onTouchEnd(event: TouchEvent): void {
    const diff = this.touchStartX() - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? this.next() : this.prev();
    }
  }

  private lockScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = 'hidden';
    }
  }

  private unlockScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = '';
    }
  }
}
