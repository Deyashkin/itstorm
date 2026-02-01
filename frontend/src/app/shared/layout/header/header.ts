import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import type { DefaultResponseType } from '../../../../types/default-response.type';
import type { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    MatMenuModule,
    MatButtonModule,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})


export class Header implements OnInit, OnDestroy  {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private subscription: Subscription = new Subscription();

  public readonly user$ = this.authService.user$;
  public readonly isLogged$ = this.authService.isLogged$;

  public ngOnInit(): void {
    if (this.authService.getIsLoggedIn() && this.authService.userId) {
      this.authService.loadUserInfo();
    }

    const sub = this.isLogged$.subscribe(isLogged => {
      if (isLogged && this.authService.userId) {
        this.authService.loadUserInfo();
      }
    });
    this.subscription.add(sub);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private showSnack(message: string): void {
    const ref = this.snackBar.open(message, 'ОК', { duration: 4000 });

    const close = () => ref.dismiss();

    setTimeout(() => {
      window.addEventListener('pointerdown', close, { once: true });
      window.addEventListener('keydown', close, { once: true });
      window.addEventListener('wheel', close, { once: true, passive: true });
      window.addEventListener('touchmove', close, { once: true, passive: true });
    }, 0);

    setTimeout(() => {
      window.addEventListener('scroll', close, { once: true, passive: true, capture: true });
      document.addEventListener('scroll', close, { once: true, passive: true, capture: true });
    }, 200);
  }

  public logout(): void {
    this.authService.logout()
      .subscribe({
        next: (data: DefaultResponseType) => {
          this.doLogout();
        },
        error: (errorRespose: HttpErrorResponse) => {
          this.doLogout();
        }
      })
  }

  public doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;

    this.router.navigate(['/']).then(() => {
      this.showSnack('Вы вышли из системы');
    });
  }
}
