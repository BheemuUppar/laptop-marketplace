import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, ReviewFormData, ReviewStats } from '../models/review.model';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly publicUrl = `${environment.apiUrl}/reviews`;
  private readonly adminUrl = `${environment.apiUrl}/admin/reviews`;

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  getVisible(): Observable<Review[]> {
    return this.http.get<Review[]>(this.publicUrl);
  }

  getFeatured(limit = 6): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.publicUrl}/featured`, { params: { limit: String(limit) } });
  }

  getAllAdmin(): Observable<Review[]> {
    return this.http.get<Review[]>(this.adminUrl, { headers: this.authHeaders() });
  }

  getByIdAdmin(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.adminUrl}/${id}`, { headers: this.authHeaders() });
  }

  getStats(): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.adminUrl}/stats/summary`, { headers: this.authHeaders() });
  }

  create(data: ReviewFormData): Observable<Review> {
    return this.http.post<Review>(this.adminUrl, data, { headers: this.authHeaders() });
  }

  update(id: string, data: Partial<ReviewFormData>): Observable<Review> {
    return this.http.put<Review>(`${this.adminUrl}/${id}`, data, { headers: this.authHeaders() });
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminUrl}/${id}`, { headers: this.authHeaders() });
  }

  toggleVisibility(id: string, isVisible?: boolean): Observable<Review> {
    return this.http.patch<Review>(`${this.adminUrl}/${id}/visibility`, { isVisible }, { headers: this.authHeaders() });
  }

  toggleFeatured(id: string, isFeatured?: boolean): Observable<Review> {
    return this.http.patch<Review>(`${this.adminUrl}/${id}/featured`, { isFeatured }, { headers: this.authHeaders() });
  }
}
