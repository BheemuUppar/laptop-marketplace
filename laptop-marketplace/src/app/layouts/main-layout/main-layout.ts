import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { WhatsappButton } from '../../shared/components/whatsapp-button/whatsapp-button';
import { MasterService } from '../../core/services/master.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Footer, WhatsappButton],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {
  private readonly masterService = inject(MasterService);

  ngOnInit(): void {
    this.masterService.loadAll().subscribe();
  }
}
