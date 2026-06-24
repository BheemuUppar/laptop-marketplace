import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo';
import { WhatsappService } from '../../core/services/whatsapp';
import { STORE_INFO } from '../../core/constants/store.constants';
import { MapSection } from '../../shared/components/map-section/map-section';

@Component({
  selector: 'app-store-location',
  imports: [MapSection],
  templateUrl: './store-location.html',
  styleUrl: './store-location.scss',
})
export class StoreLocation implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);

  readonly store = STORE_INFO;

  ngOnInit(): void {
    this.seo.update({
      title: 'Store Location',
      description: 'Visit iPro Technologies Used Laptops Store in HSR Layout, Bengaluru.',
      keywords: 'iPro Technologies store location, used laptops HSR Layout',
    });
  }

  openDirections(): void {
    window.open(this.store.mapDirectionsUrl, '_blank');
  }

  callStore(): void {
    window.open(`tel:+91${this.store.phones[0]}`, '_self');
  }

  openWhatsApp(): void {
    this.whatsapp.openGeneral('Hello, I would like to visit your store in HSR Layout. Can you share directions?');
  }
}
