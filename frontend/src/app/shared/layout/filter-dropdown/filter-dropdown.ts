import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { CategoryInterface } from '../../../../types/category.interface';

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-dropdown.html',
  styleUrls: ['./filter-dropdown.scss']
})
export class FilterDropdownComponent implements OnInit {
  @Input() selectedCategories: string[] = []; // URL категорий
  @Output() categoriesChange = new EventEmitter<string[]>(); // Эмитим URL

  categories: CategoryInterface[] = [];
  isLoading = false;
  error: string | null = null;
  isOpen = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    const apiUrl = 'http://localhost:3000/api/categories';

    this.http.get<CategoryInterface[]>(apiUrl).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Ошибка загрузки категорий:', err);
        this.error = 'Не удалось загрузить категории';
        this.isLoading = false;
      }
    });
  }

  toggleDropdown(event?: MouseEvent): void {
    // Если клик был по кнопке, просто переключаем
    if (event) {
      event.stopPropagation(); // Останавливаем всплытие
    }
    this.isOpen = !this.isOpen;
  }

  // Закрываем dropdown при клике в любом месте документа
  @HostListener('document:click')
  closeDropdown(): void {
    this.isOpen = false;
  }

  // Но не закрываем при клике внутри dropdown
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.stopPropagation(); // Останавливаем всплытие клика
  }

  toggleCategory(categoryUrl: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // Останавливаем всплытие
    }

    const index = this.selectedCategories.indexOf(categoryUrl);
    let newCategories: string[];

    if (index === -1) {
      newCategories = [...this.selectedCategories, categoryUrl];
    } else {
      newCategories = this.selectedCategories.filter(c => c !== categoryUrl);
    }

    this.categoriesChange.emit(newCategories);
  }

  isSelected(categoryUrl: string): boolean {
    return this.selectedCategories.includes(categoryUrl);
  }

  getCategoryName(categoryUrl: string): string {
    const category = this.categories.find(c => c.url === categoryUrl);
    return category ? category.name : categoryUrl;
  }

  getFilterButtonText(): string {
    if (this.selectedCategories.length === 0) {
      return 'Фильтр';
    } else if (this.selectedCategories.length === 1) {
      return this.getCategoryName(this.selectedCategories[0]);
    } else {
      return `Фильтр (${this.selectedCategories.length})`;
    }
  }
}
