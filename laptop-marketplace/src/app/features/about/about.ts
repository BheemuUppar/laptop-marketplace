import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo';
import { STORE_INFO, WHY_CHOOSE_US, GALLERY_IMAGES } from '../../core/constants/store.constants';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private readonly seo = inject(SeoService);

  readonly store = STORE_INFO;
  readonly whyChooseUs = WHY_CHOOSE_US;
  readonly storePhotos = GALLERY_IMAGES;

  ngOnInit(): void {
    this.seo.update({
      title: 'About Us',
      description: 'iPro Technologies Used Laptops Store in HSR Layout, Bengaluru. Refurbished Dell, HP, Lenovo, Apple, Asus.',
      keywords: 'iPro Technologies, used laptops HSR Layout, refurbished laptops Bengaluru',
    });
  }
}
