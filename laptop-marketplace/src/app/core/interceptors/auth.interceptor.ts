import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/auth/login');
      const isProtectedApi =
        req.url.includes('/api/admin/') ||
        req.url.includes('/api/upload') ||
        req.url.includes('/auth/change-password');

      if (error.status === 401 && isProtectedApi && !isLoginRequest) {
        auth.sessionExpired();
      }

      return throwError(() => error);
    })
  );
};
