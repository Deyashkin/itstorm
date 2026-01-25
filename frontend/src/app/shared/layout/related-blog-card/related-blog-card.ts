import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import type { ArticleInterface } from '../../../../types/article.interface';

@Component({
  selector: 'app-related-blog-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './related-blog-card.html',
  styleUrls: ['./related-blog-card.scss']
})


export class RelatedBlogCardComponent {
  @Input() article!: ArticleInterface;

  private router = inject(Router);

  navigateToArticle(): void {
    if (this.article?.url) {
      this.router.navigate(['/blog', this.article.url]);
    }
  }

  getImageUrl(): string {
    if (!this.article?.image) {
      return 'assets/images/placeholder.jpg';
    }

    const image = this.article.image;
    if (image.startsWith('http')) {
      return image;
    }

    return `assets/images/blog/${image}`;
  }

  getCategoryName(): string {
    if (!this.article?.category) return '';

    if (typeof this.article.category === 'string') {
      return this.article.category;
    }

    // Если это объект
    if (typeof this.article.category === 'object') {
      return (this.article.category as any).name ||
        (this.article.category as any).category || '';
    }

    return '';
  }

  // Форматирование даты
  getFormattedDate(): string {
    if (!this.article?.date) return '';

    try {
      return new Date(this.article.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  // Обрезание описания для sidebar
  getShortDescription(): string {
    if (!this.article?.description) return '';

    const maxLength = 80;
    if (this.article.description.length <= maxLength) {
      return this.article.description;
    }

    return this.article.description.substring(0, maxLength) + '...';
  }
}
