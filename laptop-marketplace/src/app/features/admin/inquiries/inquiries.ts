import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { InquiryService } from '../../../core/services/inquiry';
import { SeoService } from '../../../core/services/seo';
import { Inquiry, InquiryStatus } from '../../../core/models/inquiry.model';

@Component({
  selector: 'app-inquiries',
  imports: [FormsModule, DatePipe],
  templateUrl: './inquiries.html',
  styleUrl: './inquiries.scss',
})
export class Inquiries implements OnInit {
  private readonly inquiryService = inject(InquiryService);
  private readonly seo = inject(SeoService);

  readonly inquiries = signal<Inquiry[]>([]);
  readonly loading = signal(true);
  readonly statusFilter = signal<InquiryStatus | 'all'>('all');

  ngOnInit(): void {
    this.seo.update({ title: 'Manage Inquiries', description: 'Admin inquiry management' });
    this.loadInquiries();
  }

  filteredInquiries(): Inquiry[] {
    const filter = this.statusFilter();
    if (filter === 'all') return this.inquiries();
    return this.inquiries().filter(i => i.status === filter);
  }

  onFilterChange(value: string): void {
    this.statusFilter.set(value as InquiryStatus | 'all');
  }

  updateStatus(id: string, status: InquiryStatus): void {
    this.inquiryService.updateStatus(id, status).subscribe(() => this.loadInquiries());
  }

  exportCsv(): void {
    const csv = this.inquiryService.exportCsv();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  statusBadgeClass(status: InquiryStatus): string {
    switch (status) {
      case 'new': return 'badge-warning';
      case 'contacted': return 'badge bg-primary/10 text-primary';
      case 'converted': return 'badge-success';
      default: return 'badge bg-slate-100 text-slate-600';
    }
  }

  private loadInquiries(): void {
    this.loading.set(true);
    this.inquiryService.getAll().subscribe(inquiries => {
      this.inquiries.set(inquiries);
      this.loading.set(false);
    });
  }
}
