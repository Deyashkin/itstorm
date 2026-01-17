// filter-dropdown.component.ts - НОВЫЙ ФАЙЛ
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Category {
  id: string;
  name: string;
  url: string;
}

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-dropdown.html',
  styleUrls: ['./filter-dropdown.scss']
})
export class FilterDropdownComponent implements OnInit {
  @Input() selectedCategories: string[] = [];
  @Output() categoriesChange = new EventEmitter<string[]>();

  categories: Category[] = [];
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

    this.http.get<Category[]>(apiUrl).subscribe({
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

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  toggleCategory(categoryName: string): void {
    const index = this.selectedCategories.indexOf(categoryName);
    let newCategories: string[];

    if (index === -1) {
      // Добавляем категорию
      newCategories = [...this.selectedCategories, categoryName];
    } else {
      // Удаляем категорию
      newCategories = this.selectedCategories.filter(c => c !== categoryName);
    }

    this.categoriesChange.emit(newCategories);
  }

  isSelected(categoryName: string): boolean {
    return this.selectedCategories.includes(categoryName);
  }
}
