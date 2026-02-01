import {
  Component,
  inject,
  ChangeDetectionStrategy,
  input,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ArticleInterface } from '../../../../types/article.interface';
import { ArticleService } from '../../services/article.service';
import { RelatedBlogCardComponent } from '../related-blog-card/related-blog-card';

@Component({
  selector: 'app-related-articles',
  standalone: true,
  imports: [CommonModule, RelatedBlogCardComponent],
  templateUrl: './related-articles.html',
  styleUrls: ['./related-articles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedArticlesComponent {

  public readonly articleUrl = input.required<string>();

  private readonly articleService = inject(ArticleService);

  public readonly articles = signal<ArticleInterface[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const url = this.articleUrl();
      if (url) {
        this.loadRelatedArticles(url);
      }
    }, { allowSignalWrites: true });
  }

  private loadRelatedArticles(articleUrl: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.articles.set([]);

    this.articleService.getRelatedArticles(articleUrl).subscribe({
      next: (response) => {
        this.articles.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки связанных статей:', err);
        this.error.set('Не удалось загрузить похожие статьи');
        this.isLoading.set(false);
      }
    });
  }
}
