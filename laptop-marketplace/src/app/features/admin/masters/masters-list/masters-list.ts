import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterApiService } from '../../../../core/services/master-api.service';
import { MasterService } from '../../../../core/services/master.service';
import { SeoService } from '../../../../core/services/seo';
import {
  isMasterType,
  MASTER_TYPE_LABELS,
  MASTER_TYPE_SINGULAR,
  Master,
  MasterFormData,
  MasterType,
} from '../../../../core/models/master.model';

@Component({
  selector: 'app-masters-list',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './masters-list.html',
  styleUrl: './masters-list.scss',
})
export class MastersList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly masterApi = inject(MasterApiService);
  private readonly masterService = inject(MasterService);
  private readonly seo = inject(SeoService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly isEdit = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saveError = signal('');
  readonly success = signal('');
  readonly items = signal<Master[]>([]);
  readonly searchQuery = signal('');
  readonly masterType = signal<MasterType>('brand');
  readonly typeLabels = MASTER_TYPE_LABELS;
  readonly typeSingular = MASTER_TYPE_SINGULAR;

  readonly form = this.fb.group({
    value: ['', Validators.required],
    description: [''],
    displayOrder: [0, [Validators.min(0)]],
    isActive: [true],
  });

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.items();
    if (!q) return list;
    return list.filter(
      item => item.value.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const typeParam = params.get('type') ?? 'brand';
      const type = isMasterType(typeParam) ? typeParam : 'brand';
      this.masterType.set(type);
      this.searchQuery.set('');
      this.seo.update({
        title: `${MASTER_TYPE_LABELS[type]} - Masters`,
        description: `Manage ${MASTER_TYPE_LABELS[type].toLowerCase()} master data`,
      });
      this.loadItems();
    });
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  openAddModal(): void {
    this.isEdit.set(false);
    this.editingId.set(null);
    this.saveError.set('');
    this.success.set('');
    this.form.reset({ value: '', description: '', displayOrder: 0, isActive: true });
    this.showModal.set(true);
  }

  openEditModal(item: Master): void {
    this.isEdit.set(true);
    this.editingId.set(item.id);
    this.saveError.set('');
    this.form.patchValue({
      value: item.value,
      description: item.description,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.saveError.set('');
  }

  saveMaster(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveError.set('');

    const raw = this.form.getRawValue();
    const payload: MasterFormData = {
      type: this.masterType(),
      value: raw.value!.trim(),
      description: raw.description?.trim() ?? '',
      displayOrder: Number(raw.displayOrder) || 0,
      isActive: !!raw.isActive,
    };

    const id = this.editingId();
    const request = id
      ? this.masterApi.update(id, {
          value: payload.value,
          description: payload.description,
          displayOrder: payload.displayOrder,
          isActive: payload.isActive,
        })
      : this.masterApi.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(id ? 'Updated successfully.' : 'Added successfully.');
        this.closeModal();
        this.afterMutation();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.saveError.set(err.error?.message || 'Save failed.');
      },
    });
  }

  toggleStatus(item: Master): void {
    this.masterApi.setStatus(item.id, !item.isActive).subscribe({
      next: () => {
        this.success.set(`"${item.value}" ${item.isActive ? 'deactivated' : 'activated'}.`);
        this.afterMutation();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saveError.set(err.error?.message || 'Failed to update status.');
      },
    });
  }

  deactivate(item: Master): void {
    if (!confirm(`Deactivate "${item.value}"? It will be hidden from dropdowns.`)) return;

    this.masterApi.softDelete(item.id).subscribe({
      next: () => {
        this.success.set(`"${item.value}" deactivated.`);
        this.afterMutation();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saveError.set(err.error?.message || 'Failed to deactivate.');
      },
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  private loadItems(): void {
    this.loading.set(true);
    this.saveError.set('');
    this.masterApi.getAdminByType(this.masterType()).subscribe({
      next: items => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.items.set([]);
        this.loading.set(false);
        this.saveError.set('Failed to load master data.');
      },
    });
  }

  private afterMutation(): void {
    this.masterService.invalidateCache();
    this.masterService.refresh().subscribe();
    this.loadItems();
  }
}
