import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly sessionExpired = signal(false);

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [true],
  });

  ngOnInit(): void {
    this.seo.update({
      title: 'Admin Login',
      description: 'iPro Technologies admin panel login',
    });

    if (this.route.snapshot.queryParamMap.get('expired') === '1') {
      this.sessionExpired.set(true);
    }

    if (this.auth.hasValidSession()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { username, password, rememberMe } = this.form.getRawValue();
    this.auth.login({ username: username!, password: password!, rememberMe: !!rememberMe }).subscribe({
      next: () => {
        this.loading.set(false);
        const destination = this.auth.mustChangePassword() ? '/admin/account' : '/admin/dashboard';
        this.router.navigate([destination]);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid username or password.');
      },
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }
}
