import { Component, inject, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { STORE_INFO } from '../../../core/constants/store.constants';
import { WhatsappService } from '../../../core/services/whatsapp';

@Component({
  selector: 'app-map-section',
  templateUrl: './map-section.html',
  styleUrl: './map-section.scss',
})
export class MapSection {
  readonly store = STORE_INFO;
  private readonly whatsapp = inject(WhatsappService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly safeMapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.store.mapEmbedUrl);

  openDirections(): void {
    window.open(this.store.mapDirectionsUrl, '_blank');
  }

  callStore(): void {
    window.open(`tel:${this.store.phone}`, '_self');
  }

  openWhatsApp(): void {
    this.whatsapp.openGeneral('Hello, I would like to visit your store. Can you share directions?');
  }
}
