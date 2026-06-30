import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, tap, catchError, shareReplay, finalize } from 'rxjs';
import { MasterApiService } from './master-api.service';
import {
  MASTER_TYPES,
  Master,
  MasterAdminCounts,
  MasterCounts,
  MasterType,
  MastersGrouped,
} from '../models/master.model';

const EMPTY_GROUPED = MASTER_TYPES.reduce((acc, type) => {
  acc[type] = [];
  return acc;
}, {} as MastersGrouped);

@Injectable({ providedIn: 'root' })
export class MasterService {
  private readonly api = inject(MasterApiService);

  private readonly groupedSignal = signal<MastersGrouped>({ ...EMPTY_GROUPED });
  private readonly loadedSignal = signal(false);
  private readonly loadingSignal = signal(false);
  private loadRequest$: Observable<MastersGrouped> | null = null;

  readonly grouped = this.groupedSignal.asReadonly();
  readonly loaded = this.loadedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  readonly brandOptions = computed(() => this.valuesFor('brand'));
  readonly processorOptions = computed(() => this.valuesFor('processor'));
  readonly ramOptions = computed(() => this.valuesFor('ram'));
  readonly storageOptions = computed(() => this.valuesFor('storage'));
  readonly graphicsOptions = computed(() => this.valuesFor('graphics'));
  readonly screenSizeOptions = computed(() => this.valuesFor('screenSize'));
  readonly conditionOptions = computed(() => this.valuesFor('condition'));
  readonly osOptions = computed(() => this.valuesFor('os'));
  readonly laptopTypeOptions = computed(() => this.valuesFor('laptopType'));
  readonly warrantyOptions = computed(() => this.valuesFor('warranty'));
  readonly colorOptions = computed(() => this.valuesFor('color'));

  loadAll(force = false): Observable<MastersGrouped> {
    if (this.loadedSignal() && !force) {
      return of(this.groupedSignal());
    }

    if (this.loadRequest$ && !force) {
      return this.loadRequest$;
    }

    this.loadingSignal.set(true);

    this.loadRequest$ = this.api.getAllPublic().pipe(
      tap(grouped => {
        this.groupedSignal.set(this.normalizeGrouped(grouped));
        this.loadedSignal.set(true);
      }),
      catchError(() => {
        this.groupedSignal.set({ ...EMPTY_GROUPED });
        this.loadedSignal.set(false);
        return of({ ...EMPTY_GROUPED });
      }),
      finalize(() => {
        this.loadingSignal.set(false);
        this.loadRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.loadRequest$;
  }

  refresh(): Observable<MastersGrouped> {
    this.loadedSignal.set(false);
    return this.loadAll(true);
  }

  getByType(type: MasterType): Master[] {
    return this.groupedSignal()[type] ?? [];
  }

  getValues(type: MasterType): string[] {
    return this.getByType(type).map(item => item.value);
  }

  valuesFor(type: MasterType): string[] {
    return this.getValues(type);
  }

  getPublicCounts(): Observable<MasterCounts> {
    return this.api.getPublicCounts();
  }

  getAdminCounts(): Observable<MasterAdminCounts> {
    return this.api.getAdminCounts();
  }

  invalidateCache(): void {
    this.loadedSignal.set(false);
    this.loadRequest$ = null;
  }

  private normalizeGrouped(input: Partial<MastersGrouped>): MastersGrouped {
    const grouped = { ...EMPTY_GROUPED };
    MASTER_TYPES.forEach(type => {
      grouped[type] = (input[type] ?? [])
        .filter(item => item.isActive !== false)
        .sort((a, b) => a.displayOrder - b.displayOrder || a.value.localeCompare(b.value));
    });
    return grouped;
  }
}
