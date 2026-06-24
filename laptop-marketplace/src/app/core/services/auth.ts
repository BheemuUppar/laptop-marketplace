import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginCredentials, User, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'ipro_auth_token';
  private readonly userKey = 'ipro_user';
  private readonly isAuthenticatedSignal = signal(this.hasStoredToken());
  private readonly currentUserSignal = signal<User | null>(this.getStoredUser());

  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        username: credentials.username,
        password: credentials.password,
      })
      .pipe(
        tap(response => {
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
}
