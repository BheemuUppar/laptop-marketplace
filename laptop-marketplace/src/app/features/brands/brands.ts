import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo';
import { BRANDS } from '../../core/constants/store.constants';

@Component({
  selector: 'app-brands',
  imports: [RouterLink],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands implements OnInit {
  private readonly seo = inject(SeoService);
  readonly brands = BRANDS;

  ngOnInit(): void {
    this.seo.update({
      title: 'Shop by Brand',
      description: 'Browse refurbished laptops by brand - Dell, HP, Lenovo, Apple, Asus, Acer and more.',
      keywords: 'laptop brands, Dell laptops, HP laptops, Lenovo, Apple MacBook',
    });
  }
}
