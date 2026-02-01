import {
  Component,
  input,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed
} from '@angular/core';
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
  styleUrls: ['./comments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CommentsComponent implements OnInit {
  public readonly articleId = input<string>('');

  private readonly commentService = inject(CommentService);
  private readonly authService = inject(AuthService);

  protected readonly comments = signal<CommentInterface[]>([]);
  protected readonly totalComments = signal<number>(0);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isPostingComment = signal<boolean>(false);
  protected readonly loadMoreLoading = signal<boolean>(false);

  protected readonly offset = signal<number>(0);
  protected readonly limit = signal<number>(3);
  protected readonly loadMoreLimit = signal<number>(10);

  protected readonly commentText = signal<string>('');
  protected readonly isAuthenticated = signal<boolean>(false);
  protected readonly currentUser = signal<UserInfoType | null>(null);

  private readonly monthNames = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  protected readonly isComplaining = signal<boolean>(false);
  protected readonly complainedComments = signal<Set<string>>(new Set());

  constructor(private snackBar: MatSnackBar) {}

  public ngOnInit(): void {
    this.loadComments();
    this.checkAuth();
  }

  private checkAuth(): void {
    const isLoggedIn = this.authService.getIsLoggedIn();
    this.isAuthenticated.set(isLoggedIn);

    if (isLoggedIn) {
      this.authService.user$.subscribe({
        next: (user) => {
          this.currentUser.set(user);
        },
        error: () => {
          this.currentUser.set(null);
        }
      });

      this.currentUser.set(this.authService.user$.getValue());
    } else {
      this.currentUser.set(null);
    }
  }

  public loadComments(): void {
    if (!this.articleId()) return;

    this.isLoading.set(true);

    this.commentService.getComments(this.articleId(), 0, this.limit()).subscribe({
      next: (response: CommentsResponseInterface) => {
        this.comments.set(response.comments.slice(0, this.limit()));
        this.totalComments.set(response.allCount);
        this.offset.set(this.limit());
        this.isLoading.set(false);
        this.complainedComments.set(new Set());

        if (this.isAuthenticated()) {
          this.loadUserActions();
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  public loadMoreComments(): void {
    this.loadMoreLoading.set(true);

    this.commentService.getComments(this.articleId(), this.offset(), this.loadMoreLimit()).subscribe({
      next: (response) => {
        const newComments = response.comments;
        const currentComments = this.comments();

        this.comments.set([...currentComments, ...newComments]);
        this.offset.set(this.comments().length);
        this.totalComments.set(response.allCount);
        this.loadMoreLoading.set(false);

        if (this.isAuthenticated()) {
          this.loadUserActions();
        }
      },
      error: () => {
        this.loadMoreLoading.set(false);
      }
    });
  }

  private loadUserActions(): void {
    if (!this.articleId()) return;

    this.commentService.getArticleCommentActions(this.articleId()).subscribe({
      next: (actions: any[]) => {
        if (actions && Array.isArray(actions)) {
          const updatedComments = this.comments().map(comment => ({
            ...comment,
            userLiked: actions.some(action => action.comment === comment.id && action.action === 'like'),
            userDisliked: actions.some(action => action.comment === comment.id && action.action === 'dislike')
          }));
          this.comments.set(updatedComments);
        }
      },
      error: (error) => {
        console.error('Error loading user actions:', error);
      }
    });
  }

  protected onCommentTextChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.commentText.set(textarea.value);
  }

  public submitComment(): void {
    if (!this.commentText().trim() || !this.isAuthenticated()) return;

    this.isPostingComment.set(true);

    this.commentService.createComment(this.articleId(), this.commentText()).subscribe({
      next: () => {
        this.loadComments();
        this.commentText.set('');
        this.isPostingComment.set(false);
      },
      error: () => {
        this.isPostingComment.set(false);
      }
    });
  }

  public likeComment(commentId: string): void {
    const currentComments = this.comments();
    const commentIndex = currentComments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    if (!this.isAuthenticated()) {
      alert('Необходимо авторизоваться для оценки комментариев');
      return;
    }

    const comment = currentComments[commentIndex];
    const updatedComment = { ...comment };

    if (updatedComment.userDisliked) {
      updatedComment.dislikesCount = Math.max(0, updatedComment.dislikesCount - 1);
      updatedComment.userDisliked = false;
    }

    const previousLiked = updatedComment.userLiked;
    const previousLikesCount = updatedComment.likesCount;

    if (updatedComment.userLiked) {
      updatedComment.likesCount = Math.max(0, updatedComment.likesCount - 1);
      updatedComment.userLiked = false;
    } else {
      updatedComment.likesCount++;
      updatedComment.userLiked = true;
    }

    const updatedComments = [...currentComments];
    updatedComments[commentIndex] = updatedComment;
    this.comments.set(updatedComments);

    this.commentService.likeComment(commentId).subscribe({
      next: (response: any) => {
        console.log('Like успешен:', response);
      },
      error: (error) => {
        console.error('Ошибка лайка:', error);

        const rolledBackComments = [...this.comments()];
        rolledBackComments[commentIndex] = {
          ...updatedComment,
          userLiked: previousLiked,
          likesCount: previousLikesCount
        };
        this.comments.set(rolledBackComments);

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

  public dislikeComment(commentId: string): void {
    const currentComments = this.comments();
    const commentIndex = currentComments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    if (!this.isAuthenticated()) {
      alert('Необходимо авторизоваться для оценки комментариев');
      return;
    }

    const comment = currentComments[commentIndex];
    const updatedComment = { ...comment };

    if (updatedComment.userLiked) {
      updatedComment.likesCount = Math.max(0, updatedComment.likesCount - 1);
      updatedComment.userLiked = false;
    }

    const previousDisliked = updatedComment.userDisliked;
    const previousDislikesCount = updatedComment.dislikesCount;

    if (updatedComment.userDisliked) {
      updatedComment.dislikesCount = Math.max(0, updatedComment.dislikesCount - 1);
      updatedComment.userDisliked = false;
    } else {
      updatedComment.dislikesCount++;
      updatedComment.userDisliked = true;
    }

    const updatedComments = [...currentComments];
    updatedComments[commentIndex] = updatedComment;
    this.comments.set(updatedComments);

    this.commentService.dislikeComment(commentId).subscribe({
      next: (response: any) => {
        console.log('Dislike успешен:', response);
      },
      error: (error) => {
        console.error('Ошибка дизлайка:', error);

        const rolledBackComments = [...this.comments()];
        rolledBackComments[commentIndex] = {
          ...updatedComment,
          userDisliked: previousDisliked,
          dislikesCount: previousDislikesCount
        };
        this.comments.set(rolledBackComments);

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

  protected formatDate(dateString: string): string {
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

  protected getUserAvatar(comment: CommentInterface): string {
    if (comment.user.avatar) {
      return comment.user.avatar.startsWith('http')
        ? comment.user.avatar
        : `http://localhost:3000${comment.user.avatar}`;
    }
    return 'assets/images/default-avatar.png';
  }

  protected getCurrentUserAvatar(): string {
    const user = this.currentUser();
    if (!user) return 'assets/images/default-avatar.png';

    const avatar = user.avatar ||
      (user as any)?.image ||
      (user as any)?.profileImage;

    if (avatar) {
      return avatar.startsWith('http')
        ? avatar
        : `http://localhost:3000${avatar}`;
    }
    return 'assets/images/default-avatar.png';
  }

  protected readonly hasMoreComments = computed(() => {
    return this.totalComments() > this.comments().length;
  });

  public reportComment(commentId: string): void {
    const comment = this.comments().find(c => c.id === commentId);
    if (!comment) return;

    if (!this.isAuthenticated()) {
      this.showSnackBar('Для отправки жалобы необходимо авторизоваться');
      return;
    }

    this.isComplaining.set(true);

    this.commentService.reportComment(commentId).subscribe({
      next: () => {
        this.showSnackBar('Жалоба успешно отправлена');
        this.isComplaining.set(false);
      },
      error: (error) => {
        this.isComplaining.set(false);
        console.error('Ошибка отправки жалобы:', error);

        if (error.status === 409 || error.status === 400 || error.status === 422) {
          const newSet = new Set(this.complainedComments());
          newSet.add(commentId);
          this.complainedComments.set(newSet);

          const updatedComments = this.comments().map(c =>
            c.id === commentId ? { ...c, userViolated: true } : c
          );
          this.comments.set(updatedComments);

          this.showSnackBar('Жалоба уже отправлена');
        } else if (error.status === 401) {
          this.showSnackBar('Для отправки жалобы необходимо авторизоваться');
        } else if (error.status === 404) {
          this.showSnackBar('Комментарий не найден');
        } else {
          this.showSnackBar('Не удалось отправить жалобу. Попробуйте позже.');
        }
      }
    });
  }

  protected requireAuthForLike(): void {
    this.showSnackBar('Необходимо авторизоваться для оценки комментариев');
  }

  protected requireAuthForDislike(): void {
    this.showSnackBar('Необходимо авторизоваться для оценки комментариев');
  }

  protected requireAuthForReport(): void {
    this.showSnackBar('Для отправки жалобы необходимо авторизоваться');
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
