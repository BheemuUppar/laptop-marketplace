import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo';
import { WhatsappService } from '../../core/services/whatsapp';
import { STORE_INFO } from '../../core/constants/store.constants';
import { ContactForm } from '../../shared/components/contact-form/contact-form';
import { MapSection } from '../../shared/components/map-section/map-section';

@Component({
  selector: 'app-contact',
  imports: [ContactForm, MapSection],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);

  readonly store = STORE_INFO;

  ngOnInit(): void {
    this.seo.update({
      title: 'Contact Us',
      description: 'Contact iPro Technologies in HSR Layout, Bengaluru. Call 9123503135 or 6363725585.',
      keywords: 'contact iPro Technologies, used laptops HSR Layout',
    });
  }

  openWhatsApp(): void {
    this.whatsapp.openGeneral('Hello, I would like to get in touch with iPro Technologies.');
  }
}
