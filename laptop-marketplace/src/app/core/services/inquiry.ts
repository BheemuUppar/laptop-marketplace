import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactFormData, Inquiry, InquiryStatus, mapApiInquiry } from '../models/inquiry.model';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/inquiries`;

  private readonly inquiriesSignal = signal<Inquiry[]>([]);
  private readonly totalSignal = signal(0);
  private readonly newSignal = signal(0);

  readonly inquiries = this.inquiriesSignal.asReadonly();
  readonly totalInquiries = computed(() => this.totalSignal());
  readonly newInquiries = computed(() => this.newSignal());

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  submitInquiry(data: ContactFormData): Observable<Inquiry> {
    return this.http.post<Record<string, unknown>>(this.baseUrl, data).pipe(map(mapApiInquiry));
  }

  getAll(): Observable<Inquiry[]> {
    return this.http
      .get<Record<string, unknown>[]>(this.baseUrl, { headers: this.authHeaders() })
      .pipe(
        map(docs => docs.map(mapApiInquiry)),
        tap(list => this.inquiriesSignal.set(list)),
        catchError(() => of([]))
      );
  }

  refreshStats(): Observable<{ total: number; new: number }> {
    return this.http
      .get<{ total: number; new: number }>(`${this.baseUrl}/stats/count`, { headers: this.authHeaders() })
      .pipe(
        tap(s => {
          this.totalSignal.set(s.total);
          this.newSignal.set(s.new);
        }),
        catchError(() => of({ total: 0, new: 0 }))
      );
  }

  updateStatus(id: string, status: InquiryStatus): Observable<Inquiry | null> {
    return this.http
      .patch<Record<string, unknown>>(`${this.baseUrl}/${id}/status`, { status }, { headers: this.authHeaders() })
      .pipe(map(mapApiInquiry), catchError(() => of(null)));
  }

  exportCsv(): string {
    const headers = 'Name,Mobile,Email,Message,Status,Date';
    const rows = this.inquiriesSignal().map(
      i => `"${i.name}","${i.mobile}","${i.email}","${i.message}","${i.status}","${i.createdAt}"`
    );
    return [headers, ...rows].join('\n');
  }
}
