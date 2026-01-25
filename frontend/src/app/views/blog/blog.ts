import {ChangeDetectorRef, Component, inject, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; // ДОБАВЬТЕ ЭТОТ ИМПОРТ
import { Subscription } from 'rxjs'; // ДОБАВЬТЕ ЭТОТ ИМПОРТ
import { BlogPaginationComponent } from '../../shared/layout/blog-pagination/blog-pagination';
import { BlogTagsComponent } from '../../shared/layout/blog-tags/blog-tags';
import { ArticleListComponent } from '../../shared/layout/article-list/article-list';
import { ArticleService } from '../../shared/services/article.service';
import { FilterDropdownComponent } from '../../shared/layout/filter-dropdown/filter-dropdown';
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
})

export class Blog implements OnInit, OnDestroy { // ДОБАВЬТЕ OnDestroy

  private articleService = inject(ArticleService);
  private cdr = inject(ChangeDetectorRef);
  private urlParamsService = inject(UrlParamsService);
  private route = inject(ActivatedRoute); // ДОБАВЬТЕ ЭТО

  private routeSub!: Subscription; // ДОБАВЬТЕ ЭТО


  articles: ArticleInterface[] = [];
  isLoading = false;
  error: string | null = null;

  currentPage = 1;
  totalPages = 1;
  totalArticles = 0;

  selectedCategories: string[] = [];

  ngOnInit() {
    console.log('Blog ngOnInit - загружаем параметры из URL');

    // ПОДПИСЫВАЕМСЯ НА ИЗМЕНЕНИЯ QUERY ПАРАМЕТРОВ
    this.routeSub = this.route.queryParams.subscribe(params => {
      console.log('Query params изменились:', params);
      this.loadParamsFromUrl();
      this.loadArticles();
    });

    // ПЕРВОНАЧАЛЬНАЯ ЗАГРУЗКА
    this.loadParamsFromUrl();
    this.loadArticles();
  }

  ngOnDestroy() {
    // ОЧИЩАЕМ ПОДПИСКУ
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private loadParamsFromUrl(): void {
    const page = this.urlParamsService.getPage();
    const categories = this.urlParamsService.getCategories();

    console.log('loadParamsFromUrl - получены параметры:', {
      page,
      categories,
      categoriesLength: categories.length
    });

    this.currentPage = page;
    this.selectedCategories = categories;
  }

  private updateUrlParams(): void {
    console.log('updateUrlParams - обновляем URL с параметрами:', {
      page: this.currentPage,
      categories: this.selectedCategories,
      categoriesLength: this.selectedCategories.length,
      shouldRemoveCategories: this.selectedCategories.length === 0
    });

    this.urlParamsService.updateUrlParams({
      page: this.currentPage > 1 ? this.currentPage : null,
      categories: this.selectedCategories.length > 0 ? this.selectedCategories : null
    });
  }

  clearAllFilters(): void {
    console.log('clearAllFilters - очищаем все фильтры');

    // ИСПОЛЬЗУЕМ ЯВНОЕ УДАЛЕНИЕ ПАРАМЕТРОВ
    this.urlParamsService.updateUrlParams({
      page: null,
      categories: null
    });

    // ОБНОВЛЯЕМ ЛОКАЛЬНЫЕ ПЕРЕМЕННЫЕ
    this.currentPage = 1;
    this.selectedCategories = [];

    // ЗАГРУЖАЕМ СТАТЬИ
    this.loadArticles();
  }

  onCategorySelect(categories: string[]): void {
    console.log('onCategorySelect - выбраны категории:', {
      categories,
      categoriesLength: categories.length
    });

    this.selectedCategories = categories;
    this.currentPage = 1;

    // ЕСЛИ КАТЕГОРИЙ НЕТ - ЯВНО УДАЛЯЕМ ПАРАМЕТР
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
    console.log('loadArticles - загружаем статьи с параметрами:', {
      page: this.currentPage,
      categories: this.selectedCategories,
      categoriesLength: this.selectedCategories.length
    });

    this.isLoading = true;
    this.error = null;

    this.articleService.getArticles(this.currentPage, this.selectedCategories)
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.articles = response.items;
            this.totalArticles = response.count;
            this.totalPages = response.pages;

            console.log('loadArticles - статьи загружены:', {
              articlesCount: this.articles.length,
              totalArticles: this.totalArticles,
              totalPages: this.totalPages
            });

          } else {
            this.error = 'Нет данных для отображения';
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('loadArticles - ошибка:', err);
          this.error = 'Ошибка при загрузке статей';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(page: number): void {
    console.log('onPageChange - меняем страницу на:', page);
    this.currentPage = page;
    this.updateUrlParams();
    this.loadArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSortChange(sortBy: string) {
    this.currentPage = 1;
    this.loadArticles();
  }
}
