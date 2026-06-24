import { Component, inject } from '@angular/core';
import { WhatsappService } from '../../../core/services/whatsapp';

@Component({
  selector: 'app-whatsapp-button',
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.scss',
})
export class WhatsappButton {
  private readonly whatsapp = inject(WhatsappService);

  openWhatsApp(): void {
    this.whatsapp.openGeneral();
  }
}
