import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredentials, User, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'ipro_auth_token';
  private readonly userKey = 'ipro_user';
  private readonly isAuthenticatedSignal = signal(this.hasStoredToken());
  private readonly currentUserSignal = signal<User | null>(this.getStoredUser());

  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  readonly mustChangePassword = computed(() => !!this.currentUserSignal()?.mustChangePassword);

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        username: credentials.username,
        password: credentials.password,
      })
      .pipe(
        tap(response => {
          localStorage.removeItem(this.tokenKey);
          localStorage.removeItem(this.userKey);
          sessionStorage.removeItem(this.tokenKey);
          sessionStorage.removeItem(this.userKey);

          const storage = credentials.rememberMe ? localStorage : sessionStorage;
          storage.setItem(this.tokenKey, response.token);
          storage.setItem(this.userKey, JSON.stringify(response.user));
          this.isAuthenticatedSignal.set(true);
          this.currentUserSignal.set(response.user);
        }),
        catchError(() => throwError(() => new Error('Invalid username or password')))
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    this.router.navigate(['/admin/login']);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string; mustChangePassword?: boolean }> {
    return this.http
      .post<{ message: string; mustChangePassword?: boolean }>(
        `${environment.apiUrl}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: this.authHeaders() }
      )
      .pipe(
        tap(() => {
          const user = this.currentUserSignal();
          if (user) {
            const updated = { ...user, mustChangePassword: false };
            this.persistUser(updated);
            this.currentUserSignal.set(updated);
          }
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  private hasStoredToken(): boolean {
    return !!(localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey));
  }

  private getStoredUser(): User | null {
    const data = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  private persistUser(user: User): void {
    if (localStorage.getItem(this.tokenKey)) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else if (sessionStorage.getItem(this.tokenKey)) {
      sessionStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
}
