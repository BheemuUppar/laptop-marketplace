import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';
import {
  Master,
  MasterAdminCounts,
  MasterCounts,
  MasterFormData,
  MasterListResponse,
  MasterType,
  MastersGrouped,
} from '../models/master.model';

@Injectable({ providedIn: 'root' })
export class MasterApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly publicUrl = `${environment.apiUrl}/masters`;
  private readonly adminUrl = `${environment.apiUrl}/admin/masters`;

  getAllPublic(): Observable<MastersGrouped> {
    return this.http.get<MastersGrouped>(this.publicUrl);
  }

  getPublicByType(type: MasterType): Observable<Master[]> {
    return this.http.get<Master[]>(`${this.publicUrl}/${type}`);
  }

  getPublicCounts(): Observable<MasterCounts> {
    return this.http.get<MasterCounts>(`${this.publicUrl}/counts`);
  }

  getAdminList(params: {
    type?: MasterType;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<MasterListResponse> {
    let httpParams = new HttpParams();
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<MasterListResponse>(this.adminUrl, {
      headers: this.authHeaders(),
      params: httpParams,
    });
  }

  getAdminByType(type: MasterType, search = ''): Observable<Master[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Master[]>(`${this.adminUrl}/type/${type}`, {
      headers: this.authHeaders(),
      params,
    });
  }

  getAdminCounts(): Observable<MasterAdminCounts> {
    return this.http.get<MasterAdminCounts>(`${this.adminUrl}/counts`, {
      headers: this.authHeaders(),
    });
  }

  create(data: MasterFormData): Observable<Master> {
    return this.http.post<Master>(this.adminUrl, data, { headers: this.authHeaders() });
  }

  update(id: string, data: Partial<MasterFormData>): Observable<Master> {
    return this.http.put<Master>(`${this.adminUrl}/${id}`, data, { headers: this.authHeaders() });
  }

  setStatus(id: string, isActive: boolean): Observable<Master> {
    return this.http.patch<Master>(
      `${this.adminUrl}/${id}/status`,
      { isActive },
      { headers: this.authHeaders() }
    );
  }

  softDelete(id: string): Observable<{ message: string; item: Master }> {
    return this.http.delete<{ message: string; item: Master }>(`${this.adminUrl}/${id}`, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
}
