import { Component, Input, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ArticleInterface } from '../../../../types/article.interface';
import { ArticleService } from '../../services/article.service';
import { RelatedBlogCardComponent } from '../related-blog-card/related-blog-card';

@Component({
  selector: 'app-related-articles',
  standalone: true,
  imports: [CommonModule, RelatedBlogCardComponent],
  templateUrl: './related-articles.html',
  styleUrls: ['./related-articles.scss']
})
export class RelatedArticlesComponent implements OnInit {
  @Input() articleUrl!: string;

  private articleService = inject(ArticleService);
  private cdr = inject(ChangeDetectorRef);

  articles: ArticleInterface[] = [];
  isLoading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadRelatedArticles();
  }

  loadRelatedArticles(): void {
    this.isLoading = true;
    this.error = null;
    this.articles = [];
    this.cdr.detectChanges();

    this.articleService.getRelatedArticles(this.articleUrl).subscribe({
      next: (response) => {
        this.articles = response;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки связанных статей:', err);
        this.error = 'Не удалось загрузить похожие статьи';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
