import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductFilter,
  ProductFormData,
  mapApiProduct,
} from '../models/product.model';
import { AuthService } from './auth';

interface ProductStats {
  total: number;
  available: number;
  lowStock: number;
  outOfStock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  private readonly productsSignal = signal<Product[]>([]);
  private readonly statsSignal = signal<ProductStats>({ total: 0, available: 0, lowStock: 0, outOfStock: 0 });

  readonly products = this.productsSignal.asReadonly();
  readonly stats = this.statsSignal.asReadonly();
  readonly totalProducts = computed(() => this.statsSignal().total);
  readonly availableProducts = computed(() => this.statsSignal().available);
  readonly lowStockProducts = computed(() => this.statsSignal().lowStock);
  readonly outOfStockProducts = computed(() => this.statsSignal().outOfStock);

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getAll(filter?: ProductFilter): Observable<Product[]> {
    let params = new HttpParams();
    if (filter?.brand) params = params.set('brand', filter.brand);
    if (filter?.minPrice) params = params.set('minPrice', filter.minPrice);
    if (filter?.maxPrice) params = params.set('maxPrice', filter.maxPrice);
    if (filter?.processor) params = params.set('processor', filter.processor);
    if (filter?.ram) params = params.set('ram', filter.ram);
    if (filter?.storage) params = params.set('storage', filter.storage);
    if (filter?.condition) params = params.set('condition', filter.condition);
    if (filter?.graphics) params = params.set('graphics', filter.graphics);
    if (filter?.displaySize) params = params.set('displaySize', filter.displaySize);
    if (filter?.os) params = params.set('os', filter.os);
    if (filter?.laptopType) params = params.set('laptopType', filter.laptopType);
    if (filter?.color) params = params.set('color', filter.color);
    if (filter?.warranty) params = params.set('warranty', filter.warranty);
    if (filter?.availability) params = params.set('availability', filter.availability);
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.sortBy) params = params.set('sortBy', filter.sortBy);

    return this.http.get<Record<string, unknown>[]>(this.baseUrl, { params }).pipe(
      map(docs => docs.map(mapApiProduct)),
      catchError(() => of([]))
    );
  }

  getFeatured(): Observable<Product[]> {
    const params = new HttpParams().set('featured', 'true');
    return this.http.get<Record<string, unknown>[]>(this.baseUrl, { params }).pipe(
      map(docs => docs.map(mapApiProduct)),
      catchError(() => of([]))
    );
  }

  getBySlug(slug: string): Observable<Product | null> {
    return this.http.get<Record<string, unknown>>(`${this.baseUrl}/slug/${slug}`).pipe(
      map(mapApiProduct),
      catchError(() => of(null))
    );
  }

  getRelated(productId: string): Observable<Product[]> {
    return this.http.get<Record<string, unknown>[]>(`${this.baseUrl}/${productId}/related`).pipe(
      map(docs => docs.map(mapApiProduct)),
      catchError(() => of([]))
    );
  }

  getAllAdmin(): Observable<Product[]> {
    return this.http
      .get<Record<string, unknown>[]>(`${this.baseUrl}/admin/all`, { headers: this.authHeaders() })
      .pipe(
        map(docs => docs.map(mapApiProduct)),
        tap(products => this.productsSignal.set(products)),
        catchError(() => of([]))
      );
  }

  refreshStats(): Observable<ProductStats> {
    return this.http
      .get<ProductStats>(`${this.baseUrl}/admin/stats/summary`, { headers: this.authHeaders() })
      .pipe(
        tap(stats => this.statsSignal.set(stats)),
        catchError(() => of({ total: 0, available: 0, lowStock: 0, outOfStock: 0 }))
      );
  }

  addProduct(data: ProductFormData): Observable<Product> {
    return this.http
      .post<Record<string, unknown>>(this.baseUrl, data, { headers: this.authHeaders() })
      .pipe(map(mapApiProduct));
  }

  updateProduct(id: string, data: Partial<ProductFormData>): Observable<Product> {
    return this.http
      .put<Record<string, unknown>>(`${this.baseUrl}/${id}`, data, { headers: this.authHeaders() })
      .pipe(map(mapApiProduct));
  }

  updateStock(id: string, quantityAvailable: number): Observable<Product> {
    return this.http
      .patch<Record<string, unknown>>(
        `${this.baseUrl}/${id}/stock`,
        { quantityAvailable },
        { headers: this.authHeaders() }
      )
      .pipe(map(mapApiProduct));
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.http
      .delete(`${this.baseUrl}/${id}`, { headers: this.authHeaders() })
      .pipe(map(() => true), catchError(() => of(false)));
  }

  markSold(id: string): Observable<Product> {
    return this.http
      .patch<Record<string, unknown>>(`${this.baseUrl}/${id}/mark-sold`, {}, { headers: this.authHeaders() })
      .pipe(map(mapApiProduct));
  }

  toggleAvailability(id: string): Observable<Product> {
    return this.http
      .patch<Record<string, unknown>>(`${this.baseUrl}/${id}/toggle-availability`, {}, { headers: this.authHeaders() })
      .pipe(map(mapApiProduct));
  }

  uploadImages(files: File[]): Observable<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post<{ urls: string[] }>(`${environment.apiUrl}/upload`, formData, { headers });
  }
}
