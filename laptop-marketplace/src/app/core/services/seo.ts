import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly baseUrl = 'https://iprotechnologies.in';
  private readonly defaultImage = `${this.baseUrl}/assets/og-image.jpg`;

  update(config: SeoConfig): void {
    const fullTitle = config.title.includes('iPro') ? config.title : `${config.title} | iPro Technologies`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: config.description });
    if (config.keywords) this.meta.updateTag({ name: 'keywords', content: config.keywords });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: config.type ?? 'website' });
    this.meta.updateTag({ property: 'og:url', content: config.url ?? this.baseUrl });
    this.meta.updateTag({ property: 'og:image', content: config.image ?? this.defaultImage });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
  }

  setStructuredData(data: Record<string, unknown>): void {
    let script = document.querySelector('script[type="application/ld+json"]#structured-data');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'structured-data');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
}
