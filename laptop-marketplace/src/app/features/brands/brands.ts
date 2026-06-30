import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo';
import { MasterService } from '../../core/services/master.service';
import { BrandCard, buildBrandCards } from '../../core/utils/master.utils';

@Component({
  selector: 'app-brands',
  imports: [RouterLink],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly masterService = inject(MasterService);

  readonly brands = signal<BrandCard[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.seo.update({
      title: 'Shop by Brand',
      description: 'Browse refurbished laptops by brand at iPro Technologies, HSR Layout.',
      keywords: 'laptop brands, Dell laptops, HP laptops, Lenovo, Apple MacBook',
    });

    this.masterService.loadAll().subscribe({
      next: () => {
        this.brands.set(buildBrandCards(this.masterService.brandOptions()));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
