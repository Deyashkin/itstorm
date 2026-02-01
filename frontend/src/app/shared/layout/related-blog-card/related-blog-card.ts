import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ArticleInterface } from '../../../../types/article.interface';

@Component({
  selector: 'app-related-blog-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './related-blog-card.html',
  styleUrls: ['./related-blog-card.scss']
})
export class RelatedBlogCardComponent {

  public readonly article = input.required<ArticleInterface>();

  public getImageUrl(): string {
    const article = this.article();
    if (!article?.image) {
      return 'assets/images/placeholder.jpg';
    }

    const image = article.image;
    if (image.startsWith('http')) {
      return image;
    }

    return `assets/images/blog/${image}`;
  }

  public getCategoryName(): string {
    const article = this.article();
    if (!article?.category) return '';

    if (typeof article.category === 'string') {
      return article.category;
    }

    if (typeof article.category === 'object') {
      return (article.category as any).name ||
        (article.category as any).category || '';
    }

    return '';
  }

  public getFormattedDate(): string {
    const article = this.article();
    if (!article?.date) return '';

    try {
      return new Date(article.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  public getShortDescription(): string {
    const article = this.article();
    if (!article?.description) return '';

    const maxLength = 80;
    if (article.description.length <= maxLength) {
      return article.description;
    }

    return article.description.substring(0, maxLength) + '...';
  }
}
