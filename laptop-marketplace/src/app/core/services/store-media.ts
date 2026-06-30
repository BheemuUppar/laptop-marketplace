import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth';
import { StoreMediaItem, StoreMediaPublic, StoreSettings } from '../models/store-media.model';

@Injectable({ providedIn: 'root' })
export class StoreMediaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly publicUrl = `${environment.apiUrl}/store/media`;
  private readonly adminUrl = `${environment.apiUrl}/admin/store/media`;

  getPublicMedia(): Observable<StoreMediaPublic> {
    return this.http.get<StoreMediaPublic>(this.publicUrl);
  }

  getAllAdmin(): Observable<StoreMediaItem[]> {
    return this.http.get<StoreMediaItem[]>(this.adminUrl, { headers: this.authHeaders() });
  }

  getSettings(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(`${this.adminUrl}/settings`, { headers: this.authHeaders() });
  }

  saveSettings(youtubeChannelUrl: string): Observable<StoreSettings> {
    return this.http.put<StoreSettings>(
      `${this.adminUrl}/settings`,
      { youtubeChannelUrl },
      { headers: this.authHeaders() }
    );
  }

  addPhoto(imageUrl: string, title: string, displayOrder = 0): Observable<StoreMediaItem> {
    return this.http.post<StoreMediaItem>(
      `${this.adminUrl}/photos`,
      { imageUrl, title, displayOrder, isVisible: true },
      { headers: this.authHeaders() }
    );
  }

  addVideo(youtubeUrl: string, title: string, displayOrder = 0): Observable<StoreMediaItem> {
    return this.http.post<StoreMediaItem>(
      `${this.adminUrl}/videos`,
      { youtubeUrl, title, displayOrder, isVisible: true },
      { headers: this.authHeaders() }
    );
  }

  updateItem(id: string, data: Partial<StoreMediaItem>): Observable<StoreMediaItem> {
    return this.http.put<StoreMediaItem>(`${this.adminUrl}/${id}`, data, { headers: this.authHeaders() });
  }

  toggleVisibility(id: string, isVisible: boolean): Observable<StoreMediaItem> {
    return this.http.patch<StoreMediaItem>(
      `${this.adminUrl}/${id}/visibility`,
      { isVisible },
      { headers: this.authHeaders() }
    );
  }

  deleteItem(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminUrl}/${id}`, { headers: this.authHeaders() });
  }

  uploadGalleryImages(files: File[]): Observable<{ urls: string[] }> {
    const formData = new FormData();
    formData.append('folder', 'gallery');
    files.forEach(f => formData.append('images', f));
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post<{ urls: string[] }>(`${environment.apiUrl}/upload`, formData, { headers });
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
}
