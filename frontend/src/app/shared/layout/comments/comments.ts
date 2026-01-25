import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentService } from '../../services/comment.service';
import { LoaderComponent } from '../loader/loader';
import { AuthService } from '../../../core/auth/auth.service';
import type {UserInfoType} from '../../../../types/user-info.type';
import type {CommentInterface, CommentsResponseInterface} from '../../../../types/comment.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent, MatSnackBarModule],
  templateUrl: './comments.html',
  styleUrls: ['./comments.scss']
})
export class CommentsComponent implements OnInit {
  @Input() articleId: string = '';

  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  comments: CommentInterface[] = [];
  totalComments: number = 0;
  isLoading = false;
  isPostingComment = false;
  loadMoreLoading = false;

  // Пагинация
  offset = 0;
  limit = 3;
  loadMoreLimit = 10;

  // Форма комментария
  commentText = '';
  isAuthenticated = false;
  currentUser: UserInfoType | null = null;

  // Дата форматирования
  private readonly monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  isComplaining = false;
  complainedComments: Set<string> = new Set(); // Хранит ID комментариев, на которые уже пожаловались

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadComments();
    this.checkAuth();
  }

  private checkAuth(): void {
    this.isAuthenticated = this.authService.getIsLoggedIn();

    if (this.isAuthenticated) {
      this.authService.user$.subscribe({
        next: (user) => {
          this.currentUser = user;
          this.cdr.detectChanges();
        },
        error: () => {
          this.currentUser = null;
          this.cdr.detectChanges();
        }
      });

      this.currentUser = this.authService.user$.getValue();
      this.cdr.detectChanges();
    } else {
      this.currentUser = null;
      this.cdr.detectChanges();
    }
  }

  loadComments(): void {
    if (!this.articleId) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.commentService.getComments(this.articleId, 0, this.limit).subscribe({
      next: (response: CommentsResponseInterface) => {
        this.comments = response.comments;
        this.totalComments = response.allCount;
        this.offset = response.comments.length;
        this.isLoading = false;

        // Сбрасываем complainedComments перед загрузкой новых действий
        this.complainedComments.clear();

        // После загрузки комментариев получаем действия пользователя
        if (this.isAuthenticated) {
          this.loadUserActions();
        } else {
          // Если не авторизован, все равно синхронизируем complainedComments
          this.syncComplainedComments();
          this.cdr.detectChanges();
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private syncComplainedComments(): void {
    // Синхронизируем complainedComments с userViolated из загруженных комментариев
    this.comments.forEach(comment => {
      if (comment.userViolated) {
        this.complainedComments.add(comment.id);
      }
    });
  }

  private loadUserActions(): void {
    if (!this.articleId) return;

    this.commentService.getArticleCommentActions(this.articleId).subscribe({
      next: (actions: any[]) => {
        if (actions && Array.isArray(actions)) {
          // Обновляем состояния лайков/дизлайков/жалоб для каждого комментария
          this.comments.forEach(comment => {
            const commentActions = actions.filter(action => action.comment === comment.id);
            comment.userLiked = commentActions.some(action => action.action === 'like');
            comment.userDisliked = commentActions.some(action => action.action === 'dislike');
            comment.userViolated = commentActions.some(action => action.action === 'violate');

            // Если пользователь уже жаловался, добавляем в complainedComments
            if (comment.userViolated) {
              this.complainedComments.add(comment.id);
            }
          });
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading user actions:', error);
      }
    });
  }


  loadMoreComments(): void {
    this.loadMoreLoading = true;
    this.cdr.detectChanges();

    this.commentService.getComments(this.articleId, this.offset, this.loadMoreLimit).subscribe({
      next: (response) => {
        const newComments = response.comments;

        // Синхронизируем complainedComments для новых комментариев
        newComments.forEach(comment => {
          if (comment.userViolated) {
            this.complainedComments.add(comment.id);
          }
        });

        this.comments = [...this.comments, ...newComments];
        this.offset = this.comments.length;
        this.totalComments = response.allCount;
        this.loadMoreLoading = false;

        // Загружаем действия пользователя для новых комментариев
        if (this.isAuthenticated) {
          this.loadUserActions();
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.loadMoreLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitComment(): void {
    if (!this.commentText.trim() || !this.isAuthenticated) return;

    this.isPostingComment = true;
    this.cdr.detectChanges();

    this.commentService.createComment(this.articleId, this.commentText).subscribe({
      next: (newComment) => {
        // Просто добавляем новый комментарий в начало массива
        this.comments.unshift(newComment);
        this.commentText = '';
        this.totalComments++;
        this.offset++;
        this.isPostingComment = false;
        this.cdr.detectChanges(); // Используем detectChanges вместо markForCheck
      },
      error: () => {
        this.isPostingComment = false;
        this.cdr.detectChanges(); // Используем detectChanges вместо markForCheck
      }
    });
  }

  likeComment(commentId: string): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    // Проверяем авторизацию
    if (!this.isAuthenticated) {
      alert('Необходимо авторизоваться для оценки комментариев');
      return;
    }

    // Если уже дизлайкнул - снимаем дизлайк
    if (comment.userDisliked) {
      comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
      comment.userDisliked = false;
    }

    // Сохраняем предыдущее состояние для отката
    const previousLiked = comment.userLiked;
    const previousLikesCount = comment.likesCount;

    // Переключаем лайк
    if (comment.userLiked) {
      // Снимаем лайк
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      comment.userLiked = false;
    } else {
      // Ставим лайк
      comment.likesCount++;
      comment.userLiked = true;
    }

    this.cdr.detectChanges();

    // Отправляем запрос на сервер
    this.commentService.likeComment(commentId).subscribe({
      next: (response: any) => {
        console.log('Like успешен:', response);
        // Сервер обновил счетчики
      },
      error: (error) => {
        console.error('Ошибка лайка:', error);

        // Откатываем изменения при ошибке
        comment.userLiked = previousLiked;
        comment.likesCount = previousLikesCount;
        this.cdr.detectChanges();

        // Сообщение об ошибке
        if (error.status === 401) {
          alert('Необходимо авторизоваться для оценки комментариев');
        } else if (error.status === 404) {
          console.error('Проверьте URL API. Возможно, неправильный маршрут:', error.url);
          alert('Ошибка сервера. Попробуйте позже.');
        } else {
          alert('Не удалось поставить лайк. Попробуйте позже.');
        }
      }
    });
  }

  dislikeComment(commentId: string): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    // Проверяем авторизацию
    if (!this.isAuthenticated) {
      alert('Необходимо авторизоваться для оценки комментариев');
      return;
    }

    // Если уже лайкнул - снимаем лайк
    if (comment.userLiked) {
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      comment.userLiked = false;
    }

    // Сохраняем предыдущее состояние для отката
    const previousDisliked = comment.userDisliked;
    const previousDislikesCount = comment.dislikesCount;

    // Переключаем дизлайк
    if (comment.userDisliked) {
      // Снимаем дизлайк
      comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
      comment.userDisliked = false;
    } else {
      // Ставим дизлайк
      comment.dislikesCount++;
      comment.userDisliked = true;
    }

    this.cdr.detectChanges();

    // Отправляем запрос на сервер
    this.commentService.dislikeComment(commentId).subscribe({
      next: (response: any) => {
        console.log('Dislike успешен:', response);
      },
      error: (error) => {
        console.error('Ошибка дизлайка:', error);

        // Откатываем изменения при ошибке
        comment.userDisliked = previousDisliked;
        comment.dislikesCount = previousDislikesCount;
        this.cdr.detectChanges();

        // Сообщение об ошибке
        if (error.status === 401) {
          alert('Необходимо авторизоваться для оценки комментариев');
        } else if (error.status === 404) {
          console.error('Проверьте URL API. Возможно, неправильный маршрут:', error.url);
          alert('Ошибка сервера. Попробуйте позже.');
        } else {
          alert('Не удалось поставить дизлайк. Попробуйте позже.');
        }
      }
    });
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы с 0
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  }

  getUserAvatar(comment: CommentInterface): string {
    if (comment.user.avatar) {
      return comment.user.avatar.startsWith('http')
        ? comment.user.avatar
        : `http://localhost:3000${comment.user.avatar}`;
    }
    return 'assets/images/default-avatar.png';
  }

  getCurrentUserAvatar(): string {
    const avatar = this.currentUser?.avatar ||
      (this.currentUser as any)?.image ||
      (this.currentUser as any)?.profileImage;

    if (avatar) {
      return avatar.startsWith('http')
        ? avatar
        : `http://localhost:3000${avatar}`;
    }
    return 'assets/images/default-avatar.png';
  }

  // Проверка, есть ли еще комментарии для загрузки
  get hasMoreComments(): boolean {
    return this.totalComments > this.comments.length;
  }

  reportComment(commentId: string): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    // Проверяем авторизацию
    if (!this.isAuthenticated) {
      this.showSnackBar('Для отправки жалобы необходимо авторизоваться');
      return;
    }

    // Проверяем, не отправляли ли уже жалобу
    // Проверяем как локальное состояние, так и состояние из сервера
    const alreadyReported = this.complainedComments.has(commentId) || comment.userViolated;
    if (alreadyReported) {
      this.showSnackBar('Вы уже отправляли жалобу на этот комментарий');
      return;
    }

    this.isComplaining = true;
    this.cdr.detectChanges();

    this.commentService.reportComment(commentId).subscribe({
      next: () => {
        this.complainedComments.add(commentId);
        // Также обновляем состояние комментария
        comment.userViolated = true;
        this.showSnackBar('Жалоба успешно отправлена');
        this.isComplaining = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isComplaining = false;
        console.error('Ошибка отправки жалобы:', error);

        // Если ошибка связана с тем, что жалоба уже отправлена
        if (error.status === 409 || error.status === 400 || error.status === 422) {
          // Конфликт - уже отправлена
          this.complainedComments.add(commentId);
          comment.userViolated = true;
          this.showSnackBar('Жалоба уже отправлена');
        } else if (error.status === 401) {
          this.showSnackBar('Для отправки жалобы необходимо авторизоваться');
        } else if (error.status === 404) {
          this.showSnackBar('Комментарий не найден');
        } else {
          this.showSnackBar('Не удалось отправить жалобу. Попробуйте позже.');
        }

        this.cdr.detectChanges();
      }
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}

