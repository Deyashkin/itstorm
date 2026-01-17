import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
// import {MatSnackBar} from '@angular/material/snack-bar';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // const _snackbar = inject(MatSnackBar)
  const isLoggedIn = authService.getIsLoggedIn()

  if(!isLoggedIn){
    // _snackbar.open('Для доступа необходимо авторизоваться');
  }
  return isLoggedIn;
};
