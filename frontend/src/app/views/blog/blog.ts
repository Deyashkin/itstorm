import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { BlogPaginationComponent } from '../../shared/layout/blog-pagination/blog-pagination';
import { BlogTagsComponent } from '../../shared/layout/blog-tags/blog-tags';
import { ArticleListComponent } from '../../shared/layout/article-list/article-list';
import { FilterDropdownComponent } from '../../shared/layout/filter-dropdown/filter-dropdown';
import { ArticleService } from '../../shared/services/article.service';
import { UrlParamsService } from '../../shared/services/url-params.service';
import type { ArticleInterface } from '../../../types/article.interface';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BlogTagsComponent,
    ArticleListComponent,
    BlogPaginationComponent,
    FilterDropdownComponent
  ],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Blog implements OnInit, OnDestroy {

  private readonly articleService = inject(ArticleService);
  private readonly urlParamsService = inject(UrlParamsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private routeSub!: Subscription;

  protected readonly articles = signal<ArticleInterface[]>([]);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly currentPage = signal<number>(1);
  protected readonly totalPages = signal<number>(1);
  protected readonly totalArticles = signal<number>(0);
  protected readonly selectedCategories = signal<string[]>([]);

  ngOnInit() {

    this.route.queryParams.pipe(take(1)).subscribe(() => {
      this.loadParamsFromUrl();
      this.loadArticles();
    });

    this.routeSub = this.route.queryParams.subscribe(() => {
      this.loadParamsFromUrl();
      this.loadArticles();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private loadParamsFromUrl(): void {
    const page = this.urlParamsService.getPage();
    const categories = this.urlParamsService.getCategories();

    this.currentPage.set(page);
    this.selectedCategories.set(categories);
  }

  private updateUrlParams(): void {
    this.urlParamsService.updateUrlParams({
      page: this.currentPage() > 1 ? this.currentPage() : null,
      categories: this.selectedCategories().length > 0 ? this.selectedCategories() : null
    });
  }

  clearAllFilters(): void {

    this.router.navigate(['/blog'], {
      queryParams: {},
      queryParamsHandling: ''
    });

    this.currentPage.set(1);
    this.selectedCategories.set([]);
  }

  onCategorySelect(categories: string[]): void {
    this.selectedCategories.set(categories);
    this.currentPage.set(1);

    if (categories.length === 0) {
      this.urlParamsService.updateUrlParams({
        page: null,
        categories: null
      });
    } else {
      this.updateUrlParams();
    }

    this.loadArticles();
  }

  loadArticles(): void {

    this.isLoading.set(true);
    this.error.set(null);

    this.articleService.getArticles(
      this.currentPage(),
      this.selectedCategories())
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.articles.set(response.items);
            this.totalArticles.set(response.count);
            this.totalPages.set(response.pages);
          } else {
            this.error.set('Нет данных для отображения');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Ошибка при загрузке статей');
          this.isLoading.set(false);
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);    this.updateUrlParams();
    this.loadArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
