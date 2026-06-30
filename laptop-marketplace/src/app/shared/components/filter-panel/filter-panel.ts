import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductFilter } from '../../../core/models/product.model';
import { MasterService } from '../../../core/services/master.service';

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
})
export class FilterPanel implements OnInit {
  private readonly masterService = inject(MasterService);

  filter = input.required<ProductFilter>();
  filterChange = output<ProductFilter>();

  readonly mastersLoading = signal(true);
  readonly masterServiceRef = this.masterService;

  ngOnInit(): void {
    this.masterService.loadAll().subscribe({
      next: () => this.mastersLoading.set(false),
      error: () => this.mastersLoading.set(false),
    });
  }

  update(key: keyof ProductFilter, value: string | number | undefined): void {
    this.filterChange.emit({ ...this.filter(), [key]: value || undefined });
  }

  clearFilters(): void {
    this.filterChange.emit({});
  }
}
