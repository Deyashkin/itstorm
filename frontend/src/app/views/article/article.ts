import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ArticleService } from '../../shared/services/article.service';
import type { ArticleInterface } from '../../../types/article.interface';
import { RelatedArticlesComponent } from '../../shared/layout/related-articles/related-articles';
import { BreadcrumbsComponent } from '../../shared/layout/breadcrumbs/breadcrumbs';
import { CommentsComponent } from '../../shared/layout/comments/comments';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BreadcrumbsComponent,
    RelatedArticlesComponent,
    CommentsComponent
  ],
  templateUrl: './article.html',
  styleUrl: './article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Article implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly sanitizer = inject(DomSanitizer);

  public readonly article = signal<ArticleInterface | null>(null);
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);
  public readonly articleContent = signal<SafeHtml>('');
  public readonly currentUrl = signal<string>('');

  public readonly hasArticle = computed<boolean>(() => {
    return this.article() !== null;
  });

  public readonly shouldShowContent = computed<boolean>(() => {
    return !this.isLoading() && !this.error() && this.hasArticle();
  });

  public readonly shouldShowNotFound = computed<boolean>(() => {
    return !this.isLoading() && !this.error() && !this.hasArticle();
  });

  public ngOnInit(): void {
    this.currentUrl.set(window.location.href);
    this.loadArticle();
  }

  public loadArticle(): void {
    const articleUrl = this.route.snapshot.paramMap.get('url');

    if (!articleUrl) {
      this.error.set('Статья не найдена');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.article.set(null);
    this.articleContent.set('');

    this.articleService.getArticleByUrl(articleUrl).subscribe({
      next: (article) => {
        this.article.set(article);
        this.articleContent.set(this.sanitizer.bypassSecurityTrustHtml(article.text || ''));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки статьи:', err);
        this.error.set('Не удалось загрузить статью');
        this.isLoading.set(false);
      }
    });
  }

  public getFormattedDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  public getImageUrl(image: string): string {
    if (!image) {
      return 'assets/images/placeholder.jpg';
    }

    if (image.startsWith('http')) {
      return image;
    }

    return `assets/images/blog/${image}`;
  }

  public shareOnVK(): void {
    const currentArticle = this.article();
    if (!currentArticle) {
      return;
    }

    const url = encodeURIComponent(this.currentUrl());
    const title = encodeURIComponent(currentArticle.title || '');
    const description = encodeURIComponent(currentArticle.description || '');
    const image = encodeURIComponent(currentArticle.image ? this.getImageUrl(currentArticle.image) : '');

    const shareUrl = `https://vk.com/share.php?url=${url}&title=${title}&description=${description}&image=${image}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  public shareOnFacebook(): void {
    const url = encodeURIComponent(this.currentUrl());
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  public shareOnInstagram(): void {
    alert('Для публикации в Instagram скопируйте ссылку на статью и добавьте в описание вашего поста.');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.currentUrl())
        .then(() => {
          console.log('Ссылка скопирована в буфер обмена');
        })
        .catch(err => {
          console.error('Ошибка копирования ссылки:', err);
        });
    }
  }
}
