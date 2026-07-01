import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredentials, User, AuthResponse } from '../models/user.model';
import { isTokenExpired } from '../utils/jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'ipro_auth_token';
  private readonly userKey = 'ipro_user';
  private readonly isAuthenticatedSignal = signal(this.hasValidStoredSession());
  private readonly currentUserSignal = signal<User | null>(
    this.hasValidStoredSession() ? this.getStoredUser() : null
  );
  private sessionRedirectPending = false;

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
          this.clearStorage();
          const storage = credentials.rememberMe ? localStorage : sessionStorage;
          storage.setItem(this.tokenKey, response.token);
          storage.setItem(this.userKey, JSON.stringify(response.user));
          this.isAuthenticatedSignal.set(true);
          this.currentUserSignal.set(response.user);
          this.sessionRedirectPending = false;
        }),
        catchError(() => throwError(() => new Error('Invalid username or password')))
      );
  }

  logout(): void {
    this.clearStorage();
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    this.sessionRedirectPending = false;
    this.router.navigate(['/admin/login']);
  }

  /** Clear invalid/expired session and redirect to login (once). */
  sessionExpired(): void {
    this.clearStorage();
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);

    if (this.sessionRedirectPending) return;
    this.sessionRedirectPending = true;

    const onLoginPage = this.router.url.startsWith('/admin/login');
    const navigate = onLoginPage
      ? Promise.resolve(true)
      : this.router.navigate(['/admin/login'], { queryParams: { expired: '1' } });

    navigate.finally(() => {
      this.sessionRedirectPending = false;
    });
  }

  /** Read-only check — does not redirect. */
  hasValidSession(): boolean {
    const token = this.readToken();
    return !!token && !isTokenExpired(token);
  }

  /** Used by route guards when session is invalid. */
  rejectInvalidSession(): void {
    if (this.readToken()) {
      this.sessionExpired();
    } else {
      this.clearStorage();
      this.isAuthenticatedSignal.set(false);
      this.currentUserSignal.set(null);
    }
  }

  /** Used by route guards — validates JWT expiry, not just token presence. */
  isSessionValid(): boolean {
    if (this.hasValidSession()) return true;
    this.rejectInvalidSession();
    return false;
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
    return this.hasValidSession() ? this.readToken() : null;
  }

  private hasValidStoredSession(): boolean {
    if (!this.hasValidSession()) {
      this.clearStorage();
      return false;
    }
    return true;
  }

  private readToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
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
