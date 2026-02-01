import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authForwardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getIsLoggedIn()) {
    router.navigate(['/']); // или router.navigateByUrl('/')
    return false;
  }

  return true;
};
