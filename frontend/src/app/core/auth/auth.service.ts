import { Injectable } from '@angular/core';
import { BehaviorSubject, type Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { LoginResponseType } from '../../../types/login-response.type';
import type { DefaultResponseType } from '../../../types/default-response.type';
import type { UserInfoType } from '../../../types/user-info.type';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public accessTokenKey: string = 'accessToken';
  public refreshTokenKey: string = 'refreshToken';
  public userIdKey: string = 'userId';

  public isLogged$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public user$: BehaviorSubject<UserInfoType | null> = new BehaviorSubject<UserInfoType | null>(null);

  private isLogged: boolean = false;

  constructor(private http: HttpClient) {

    const hasToken = !!localStorage.getItem(this.accessTokenKey);
    this.isLogged$.next(hasToken); // Устанавливаем начальное состояние

    if (hasToken && this.userId) {
      this.loadUserInfo(); // Загружаем информацию о пользователе
    }
  }

  login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
      email, password, rememberMe
    });
  }

  signup(email: string, password: string,): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
      email, password
    });
  }

  logout(): Observable<DefaultResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this.http.post<DefaultResponseType>(environment.api + 'logout', {
        refreshToken: tokens.refreshToken,
      });
    }
    throw throwError(() => 'Can not find token');
  }

  refresh(): Observable<DefaultResponseType | LoginResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this.http.post<DefaultResponseType>(environment.api + 'refresh', {
        refreshToken: tokens.refreshToken,
      });
    }
    throw throwError(() => 'Can not use token');
  }

  getUserInfo(): Observable<UserInfoType | DefaultResponseType> {
    return this.http.get<UserInfoType | DefaultResponseType>(environment.api + 'users');
  }

  loadUserInfo(): void {
    if (this.isLogged$.getValue()) {
      this.getUserInfo().subscribe({
        next: (data: UserInfoType | DefaultResponseType) => {
          if ((data as UserInfoType).id) {
            this.user$.next(data as UserInfoType);
          }
        },
        error: () => {
          this.user$.next(null);
        }
      });
    }
  }

  public getIsLoggedIn() {
    return this.isLogged$.getValue();
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged$.next(true);
    this.userId = this.getUserIdFromToken(accessToken);

    if (this.userId) {
      this.loadUserInfo();
    }
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged$.next(false);
    this.user$.next(null);
  }

  public getTokens(): {
    accessToken: string | null,
    refreshToken: string | null
  } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey)
    }
  }

  get userId(): null | string {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(id: null | string) {
    if (id) {
      localStorage.setItem(this.userIdKey, id);
      if (this.isLogged$.getValue()) {
        this.loadUserInfo();
      }
    } else {
      localStorage.removeItem(this.userIdKey);
    }
  }

  // Вспомогательный метод для получения userId из токена
  private getUserIdFromToken(token: string): string {
    try {
      // Если токен JWT, можно декодировать его часть
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || '';
    } catch {
      return '';
    }
  }
}
