import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import type { DefaultResponseType } from '../../../../types/default-response.type';
import type { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    MatMenuModule,
    MatButtonModule,
    ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})


export class Header implements OnInit, OnDestroy  {
  private authService = inject(AuthService);
  private router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private subscription: Subscription = new Subscription();

  public user$ = this.authService.user$;
  public isLogged$ = this.authService.isLogged$;

  constructor() {}

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private showSnack(message: string): void {
    const ref = this._snackBar.open(message, 'ОК', { duration: 4000 });

    const close = () => ref.dismiss();

    // Закрытие по клику/клавишам/скроллу колёсиком/тачем
    setTimeout(() => {
      window.addEventListener('pointerdown', close, { once: true });
      window.addEventListener('keydown', close, { once: true });
      window.addEventListener('wheel', close, { once: true, passive: true });
      window.addEventListener('touchmove', close, { once: true, passive: true });
    }, 0);

    // Закрытие при перетаскивании полосы прокрутки мышью (scroll capture)
    // Задержка нужна, чтобы не закрывалось сразу из-за navigate()
    setTimeout(() => {
      window.addEventListener('scroll', close, { once: true, passive: true, capture: true });
      document.addEventListener('scroll', close, { once: true, passive: true, capture: true });
    }, 200);
  }

  logout(): void {
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

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;

    // Сначала навигация, потом snackbar (иначе "scroll" может закрыть его мгновенно)
    this.router.navigate(['/']).then(() => {
      this.showSnack('Вы вышли из системы');
    });
  }
}
