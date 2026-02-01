import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type OnInit
} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import type {LoginResponseType} from '../../../../types/login-response.type';
import type {DefaultResponseType} from '../../../../types/default-response.type';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class Login implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  public readonly isSubmitting = signal<boolean>(false);
  public readonly loginForm: FormGroup;


  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  public ngOnInit(): void {}


  public login(): void {
    if (this.loginForm.invalid || !this.loginForm.value.email || !this.loginForm.value.password) {
      return;
    }

    this.isSubmitting.set(true);

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, !!rememberMe)
      .subscribe({
        next: (data: LoginResponseType | DefaultResponseType) => {
          const error = this.getAuthError(data);

          if (error) {
            this.snackBar.open(error);
            this.isSubmitting.set(false);
            return;
          }

          const loginResponse = data as LoginResponseType;

          this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
          this.authService.userId = loginResponse.userId;

          this.router.navigate(['/']).then(() => {
            this.showSnack('Вы успешно авторизовались');
          });
        },
        error: (errorResponse: HttpErrorResponse) => {
          const errorMessage = errorResponse.error?.message || 'Ошибка авторизации';
          this.snackBar.open(errorMessage);
          this.isSubmitting.set(false);
        }
      });
  }

  private getAuthError(data: LoginResponseType | DefaultResponseType): string | null {
    if ((data as DefaultResponseType).error !== undefined) {
      return (data as DefaultResponseType).message;
    }

    const loginResponse = data as LoginResponseType;
    if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
      return 'Ошибка авторизации';
    }

    return null;
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
}
