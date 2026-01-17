import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authForwardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // если пользователь уже залогинен — перекидываем на главную
  if (authService.getIsLoggedIn()) {
    router.navigate(['/']); // или router.navigateByUrl('/')
    return false;
  }

  // иначе — разрешаем открыть страницу (login/signup)
  return true;
};
