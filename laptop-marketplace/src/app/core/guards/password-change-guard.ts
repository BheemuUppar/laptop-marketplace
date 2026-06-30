import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/** Redirects to Account when a temporary password must be changed first. */
export const passwordChangeGuard: CanActivateChildFn = route => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.mustChangePassword()) return true;
  if (route.routeConfig?.path === 'account') return true;
  return router.createUrlTree(['/admin/account']);
};
