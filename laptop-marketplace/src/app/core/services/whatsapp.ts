import { Injectable } from '@angular/core';
import { STORE_INFO } from '../constants/store.constants';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly phone = STORE_INFO.whatsapp;

  getInquiryUrl(model: string, price: number): string {
    const message = `Hello,\n\nI am interested in the following laptop:\n\nModel: ${model}\nPrice: ₹${price.toLocaleString('en-IN')}\n\nIs it currently available?\n\nPlease share more details.`;
    return `https://wa.me/${this.phone}?text=${encodeURIComponent(message)}`;
  }

  getGeneralUrl(message?: string): string {
    const text = message ?? 'Hello, I would like to know more about your refurbished laptops.';
    return `https://wa.me/${this.phone}?text=${encodeURIComponent(text)}`;
  }

  openInquiry(model: string, price: number): void {
    window.open(this.getInquiryUrl(model, price), '_blank');
  }

  openGeneral(message?: string): void {
    window.open(this.getGeneralUrl(message), '_blank');
  }
}
