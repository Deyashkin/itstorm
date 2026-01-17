import {Component, inject, type OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthService} from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('itstorm');
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Принудительная загрузка информации о пользователе при старте приложения
    if (this.authService.getIsLoggedIn()) {
      this.authService.loadUserInfo();
    }
  }
}
