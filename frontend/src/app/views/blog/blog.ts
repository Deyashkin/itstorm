import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogPaginationComponent } from '../../shared/layout/blog-pagination/blog-pagination';
import { BlogTagsComponent } from '../../shared/layout/blog-tags/blog-tags';
import { ArticleListComponent } from '../../shared/layout/article-list/article-list';
import { ArticleService } from '../../shared/services/article.service';
import type { ArticleInterface } from '../../../types/article.interface';
import {
  FilterDropdownComponent
} from '../../shared/layout/filter-dropdown/filter-dropdown';


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


export class Blog implements OnInit {

  private articleService = inject(ArticleService);
  private cdr = inject(ChangeDetectorRef);

  articles: ArticleInterface[] = [];
  isLoading = false;
  error: string | null = null;

  currentPage = 1;
  totalPages = 1;
  totalArticles = 0;

  // Фильтры
  selectedCategories: string[] = [];
  sortBy: string = 'newest'; // newest, oldest, popular

  ngOnInit() {
    this.loadArticles();
  }

  onCategorySelect(categories: string[]): void {
    this.selectedCategories = categories;
    console.log('Selected categories:', categories);
    // Здесь можно вызвать обновление статей через ArticleListComponent если нужно
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;

    this.articleService.getArticles(this.currentPage, this.selectedCategories)
      .subscribe({
      next: (response) => {
        if (response && response.items) {
          this.articles = response.items;
          this.totalArticles = response.count;
          this.totalPages = response.pages;

          console.log('Загружено статей:', this.articles.length);
          console.log('Всего страниц:', this.totalPages);
          console.log('Всего статей:', this.totalArticles);
        } else {
          this.error = 'Нет данных для отображения';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке статей';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadArticles(); // ЗАГРУЗКА СТАТЕЙ ДЛЯ НОВОЙ СТРАНИЦЫ
    window.scrollTo({ top: 0, behavior: 'smooth' }); // ПРОКРУТКА ВВЕРХ
  }

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
    this.currentPage = 1;
    this.loadArticles(); // ПЕРЕЗАГРУЗКА С УЧЕТОМ СОРТИРОВКИ
  }


  // onCategorySelect(categories: string[]) {
  //   this.selectedCategories = categories;
  //   this.currentPage = 1; // Сбрасываем на первую страницу при изменении фильтров
  //   this.loadArticles();
  // }



  // Метод для перехода к детальной статье
  // navigateToArticle(articleId: string) {
  //   this.router.navigate(['/blog', articleId]);
  // }
  // protected readonly error = error;
}
