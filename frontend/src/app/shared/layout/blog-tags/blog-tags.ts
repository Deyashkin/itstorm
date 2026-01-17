import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type {ArticleInterface} from '../../../../types/article.interface';
import {ArticleService} from '../../services/article.service';

@Component({
  selector: 'app-blog-tags',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './blog-tags.html',
  styleUrl: './blog-tags.scss',
})
export class BlogTagsComponent {
  @Input() selectedCategories: string[] = [];
  @Output() categoriesChange = new EventEmitter<string[]>();

  articles: ArticleInterface[] = [];
  isLoading = true;
  error: string | null = null;

  currentPage = 1;
  totalPages = 1;
  totalArticles = 0;
  itemsPerPage = 8;

  sortBy: string = 'newest';

  // Пример категорий - можно загружать с API
  availableCategories = [
    'Фриланс', 'Дизайн', 'SMM', 'Таргет', 'Копирайтинг',
    'Программирование', 'Маркетинг', 'SEO'
  ];

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;

    this.articleService.getArticles(this.currentPage, this.selectedCategories,).subscribe({
      next: (response) => {
        if (response && response.items) {
          this.articles = response.items;
          this.totalArticles = response.count || 0;
          this.totalPages = response.pages || 1;
          console.log(`Загружено ${this.articles.length} статей, всего ${this.totalArticles}`);
        } else {
          this.error = 'Нет данных для отображения';
          this.articles = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Ошибка загрузки статей:', err);
        this.error = 'Ошибка при загрузке статей';
        this.isLoading = false;
      }
    });
  }

  onCategorySelect(categories: string[]): void {
    this.selectedCategories = categories;
    this.currentPage = 1; // Сбрасываем на первую страницу
    this.loadArticles();
  }

  onPageChange(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadArticles();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.currentPage = 1; // Сбрасываем на первую страницу
    this.loadArticles();
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);

    if (index === -1) {
      // Добавляем категорию
      this.selectedCategories = [...this.selectedCategories, category];
    } else {
      // Удаляем категорию
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    }

    // Отправляем изменения родителю
    this.categoriesChange.emit(this.selectedCategories);
  }

  removeCategory(category: string) {
    this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    this.categoriesChange.emit(this.selectedCategories);
  }

  clearAll() {
    this.selectedCategories = [];
    this.categoriesChange.emit(this.selectedCategories);
  }

  isSelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }
}
