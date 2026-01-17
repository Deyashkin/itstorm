import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, finalize, switchMap, throwError } from 'rxjs';
import { LoaderService } from '../../shared/services/loader.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loaderService = inject(LoaderService);

  loaderService.show();

  const tokens = authService.getTokens();

  if (tokens && tokens.accessToken) {
    const authReq = req.clone({
      headers: req.headers.set('x-auth', tokens.accessToken)
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
          return handle401Error(authReq, next, authService, router);
        }
        return throwError(() => error);
      }),
      finalize(() => loaderService.hide())
    );
  }

  return next(req).pipe(
    finalize(() => loaderService.hide())
  );
};

function handle401Error(
  req: Parameters<HttpInterceptorFn>[0],
  next: Parameters<HttpInterceptorFn>[1],
  authService: AuthService,
  router: Router
) {
  return authService.refresh().pipe(
    switchMap((result: any) => {
      let error = '';

      if (result.error !== undefined) {
        error = result.message;
      }

      if (!result.accessToken || !result.refreshToken || !result.userId) {
        error = "Ошибка авторизации";
      }

      if (error) {
        return throwError(() => new Error(error));
      }

      authService.setTokens(result.accessToken, result.refreshToken);

      const authReq = req.clone({
        headers: req.headers.set('x-auth', result.accessToken)
      });

      return next(authReq);
    }),
    catchError(error => {
      authService.removeTokens();
      router.navigate(['/']);
      return throwError(() => error);
    })
  );
}
