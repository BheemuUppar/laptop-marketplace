import { Component, input, signal, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-counter-animation',
  templateUrl: './counter-animation.html',
  styleUrl: './counter-animation.scss',
})
export class CounterAnimation implements OnInit {
  target = input.required<number>();
  label = input.required<string>();
  suffix = input('');
  prefix = input('');

  readonly displayValue = signal(0);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.displayValue.set(this.target());
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.animate();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    setTimeout(() => {
      const el = document.querySelector(`[data-counter="${this.label()}"]`);
      if (el) observer.observe(el);
    });
  }

  private animate(): void {
    const target = this.target();
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayValue.set(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
