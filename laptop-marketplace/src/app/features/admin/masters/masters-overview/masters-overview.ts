import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../../core/services/seo';
import { MasterApiService } from '../../../../core/services/master-api.service';
import { MasterService } from '../../../../core/services/master.service';
import {
  MASTER_TYPES,
  MASTER_TYPE_LABELS,
  MasterAdminCounts,
  MasterType,
} from '../../../../core/models/master.model';

@Component({
  selector: 'app-masters-overview',
  imports: [RouterLink],
  templateUrl: './masters-overview.html',
  styleUrl: './masters-overview.scss',
})
export class MastersOverview implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly masterApi = inject(MasterApiService);
  private readonly masterService = inject(MasterService);

  readonly loading = signal(true);
  readonly counts = signal<MasterAdminCounts | null>(null);
  readonly masterTypes = MASTER_TYPES;
  readonly typeLabels = MASTER_TYPE_LABELS;

  ngOnInit(): void {
    this.seo.update({ title: 'Masters - Admin', description: 'Manage dropdown master data' });
    this.loadCounts();
  }

  countFor(type: MasterType): number {
    return this.counts()?.[type]?.active ?? 0;
  }

  private loadCounts(): void {
    this.loading.set(true);
    this.masterApi.getAdminCounts().subscribe({
      next: counts => {
        this.counts.set(counts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
