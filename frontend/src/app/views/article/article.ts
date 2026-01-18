import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArticleService } from '../../shared/services/article.service';
import type { ArticleInterface } from '../../../types/article.interface';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef); // Добавляем ChangeDetectorRef

  article: ArticleInterface | null = null;
  isLoading = false;
  error: string | null = null;
  articleContent: SafeHtml = '';

  ngOnInit(): void {
    this.loadArticle();
  }

  loadArticle(): void {
    this.isLoading = true;
    this.error = null;
    this.article = null; // Сбрасываем предыдущую статью
    this.articleContent = '';
    this.cdr.detectChanges(); // Запускаем обнаружение изменений сразу

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
        this.cdr.detectChanges(); // Важно: запускаем после загрузки данных
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
}
