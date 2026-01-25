import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArticleService } from '../../shared/services/article.service';
import type { ArticleInterface } from '../../../types/article.interface';
import {
  RelatedArticlesComponent
} from '../../shared/layout/related-articles/related-articles';
import {
  BreadcrumbsComponent
} from '../../shared/layout/breadcrumbs/breadcrumbs';
import {CommentsComponent} from '../../shared/layout/comments/comments';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink, BreadcrumbsComponent, RelatedArticlesComponent, CommentsComponent],
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  article: ArticleInterface | null = null;
  isLoading = false;
  error: string | null = null;
  articleContent: SafeHtml = '';
  currentUrl: string = '';

  ngOnInit(): void {
    this.currentUrl = window.location.href;
    this.loadArticle();
  }

  loadArticle(): void {
    this.isLoading = true;
    this.error = null;
    this.article = null;
    this.articleContent = '';
    this.cdr.detectChanges();

    const articleUrl = this.route.snapshot.paramMap.get('url');

    if (!articleUrl) {
      this.error = 'Статья не найдена';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.articleService.getArticleByUrl(articleUrl).subscribe({
      next: (article) => {
        this.article = article;
        this.articleContent = this.sanitizer.bypassSecurityTrustHtml(article.text || '');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки статьи:', err);
        this.error = 'Не удалось загрузить статью';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getFormattedDate(dateString: string): string {
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

  getImageUrl(image: string): string {
    if (!image) return 'assets/images/placeholder.jpg';

    if (image.startsWith('http')) {
      return image;
    }

    return `assets/images/blog/${image}`;
  }

  shareOnVK(): void {
    if (!this.article) return;

    const url = encodeURIComponent(this.currentUrl);
    const title = encodeURIComponent(this.article.title || '');
    const description = encodeURIComponent(this.article.description || '');
    const image = encodeURIComponent(this.article.image ? this.getImageUrl(this.article.image) : '');

    const shareUrl = `https://vk.com/share.php?url=${url}&title=${title}&description=${description}&image=${image}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(this.currentUrl);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  shareOnInstagram(): void {
    // Instagram не имеет официального API для шаринга через URL
    alert('Для публикации в Instagram скопируйте ссылку на статью и добавьте в описание вашего поста.');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.currentUrl)
        .then(() => {
          console.log('Ссылка скопирована в буфер обмена');
        })
        .catch(err => {
          console.error('Ошибка копирования ссылки:', err);
        });
    }
  }
}
