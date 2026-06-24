import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product';
import { ReviewService } from '../../core/services/review';
import { SeoService } from '../../core/services/seo';
import { Product } from '../../core/models/product.model';
import { Review } from '../../core/models/review.model';
import {
  BRANDS,
  FAQ_ITEMS,
  TRUST_BADGES,
  WHY_CHOOSE_US,
  STORE_INFO,
  GALLERY_IMAGES,
  YOUTUBE_VIDEOS,
} from '../../core/constants/store.constants';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ContactForm } from '../../shared/components/contact-form/contact-form';
import { MapSection } from '../../shared/components/map-section/map-section';
import { SkeletonLoader } from '../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { TestimonialCard } from '../../shared/components/testimonial-card/testimonial-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, ContactForm, MapSection, SkeletonLoader, EmptyState, TestimonialCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly reviewService = inject(ReviewService);
  private readonly seo = inject(SeoService);

  readonly store = STORE_INFO;
  readonly brands = BRANDS;
  readonly faqItems = FAQ_ITEMS;
  readonly trustBadges = TRUST_BADGES;
  readonly whyChooseUs = WHY_CHOOSE_US;
  readonly galleryImages = GALLERY_IMAGES;
  readonly youtubeVideos = YOUTUBE_VIDEOS;

  readonly featuredProducts = signal<Product[]>([]);
  readonly featuredReviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly reviewsLoading = signal(true);
  readonly openFaq = signal<number | null>(null);

  ngOnInit(): void {
    this.seo.update({
      title: 'iPro Technologies - Used & Refurbished Laptops in HSR Layout, Bengaluru',
      description: 'iPro Technologies Used Laptops Store in HSR Layout, Bengaluru. Dell, HP, Lenovo, Apple/MacBook, Asus. Warranty available. Call 9123503135.',
      keywords: 'used laptops HSR Layout, refurbished laptops Bengaluru, iPro Technologies, Dell HP Lenovo Apple Asus',
    });
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: STORE_INFO.name,
      description: 'Refurbished and used laptop store in HSR Layout, Bengaluru',
      address: { '@type': 'PostalAddress', streetAddress: STORE_INFO.address, addressLocality: 'Bengaluru' },
      telephone: STORE_INFO.phones,
      openingHours: 'Mo-Su 10:30-20:00',
    });

    this.productService.getFeatured().subscribe(products => {
      this.featuredProducts.set(products);
      this.loading.set(false);
    });

    this.reviewService.getFeatured(6).subscribe({
      next: reviews => {
        this.featuredReviews.set(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => this.reviewsLoading.set(false),
    });
  }

  toggleFaq(index: number): void {
    this.openFaq.update(v => (v === index ? null : index));
  }
}
