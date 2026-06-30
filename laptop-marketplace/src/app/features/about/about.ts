import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo';
import { StoreMediaService } from '../../core/services/store-media';
import { STORE_INFO, WHY_CHOOSE_US } from '../../core/constants/store.constants';
import { GalleryPhoto } from '../../core/models/store-media.model';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly storeMediaService = inject(StoreMediaService);

  readonly store = STORE_INFO;
  readonly whyChooseUs = WHY_CHOOSE_US;
  readonly storePhotos = signal<GalleryPhoto[]>([]);

  ngOnInit(): void {
    this.seo.update({
      title: 'About Us',
      description: 'iPro Technologies Used Laptops Store in HSR Layout, Bengaluru. Refurbished Dell, HP, Lenovo, Apple, Asus.',
      keywords: 'iPro Technologies, used laptops HSR Layout, refurbished laptops Bengaluru',
    });

    this.storeMediaService.getPublicMedia().subscribe({
      next: media => this.storePhotos.set(media.photos),
    });
  }
}
