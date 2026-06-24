import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductFilter } from '../../../core/models/product.model';
import { FILTER_OPTIONS } from '../../../core/constants/store.constants';

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
})
export class FilterPanel {
  filter = input.required<ProductFilter>();
  filterChange = output<ProductFilter>();
  readonly options = FILTER_OPTIONS;

  update(key: keyof ProductFilter, value: string | number | undefined): void {
    this.filterChange.emit({ ...this.filter(), [key]: value || undefined });
  }

  clearFilters(): void {
    this.filterChange.emit({});
  }
}
