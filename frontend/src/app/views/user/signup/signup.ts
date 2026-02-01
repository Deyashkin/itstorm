import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type OnInit
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PasswordRepeatDirective } from '../../../shared/directives/password-repeat.directive';
import type { LoginResponseType } from '../../../../types/login-response.type';
import type { HttpErrorResponse } from '@angular/common/http';
import type { DefaultResponseType } from '../../../../types/default-response.type';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PasswordRepeatDirective, MatSnackBarModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Signup implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  public readonly isSubmitting = signal<boolean>(false);
  public readonly signupForm: FormGroup;

  constructor() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
      passwordRepeat: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
      agree: [false, [Validators.requiredTrue]],
    });
  }

  public ngOnInit(): void {}

  public signup(): void {
    if (this.signupForm.invalid || !this.signupForm.value.email || !this.signupForm.value.password || !this.signupForm.value.agree) {
      return;
    }

    if (this.signupForm.value.password !== this.signupForm.value.passwordRepeat) {
      this.showSnack('Пароли не совпадают');
      return;
    }

    this.isSubmitting.set(true);

    const { email, password } = this.signupForm.value;

    this.authService.signup(email, password)
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
            this.showSnack('Вы успешно зарегистрировались');
          });
        },
        error: (errorResponse: HttpErrorResponse) => {
          const errorMessage = errorResponse.error?.message || 'Ошибка регистрации';
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
