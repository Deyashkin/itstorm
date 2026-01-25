import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import type { CategoryInterface } from '../../../../types/category.interface';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styles: [``]
})


export class CategoryListComponent implements OnInit {
  categories: CategoryInterface[] = [];
  selectedCategories: string[] = []; // Храним только ID выбранных категорий

  @Output() categorySelected = new EventEmitter<string[]>();
  @Output() categoryUrlSelected = new EventEmitter<string>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  toggleCategory(category: CategoryInterface) {
    const index = this.selectedCategories.indexOf(category.id);

    if (index > -1) {
      // Удаляем категорию из выбранных
      this.selectedCategories.splice(index, 1);
    } else {
      // Добавляем категорию в выбранные
      this.selectedCategories.push(category.id);
    }

    // Эмитим событие с выбранными ID категорий
    this.categorySelected.emit([...this.selectedCategories]);

    // Если выбрана только одна категория, можно эмитить и URL
    if (this.selectedCategories.length === 1) {
      const selectedCategory = this.categories.find(c => c.id === this.selectedCategories[0]);
      if (selectedCategory) {
        this.categoryUrlSelected.emit(selectedCategory.url);
      }
    }
  }

  isSelected(category: CategoryInterface): boolean {
    return this.selectedCategories.includes(category.id);
  }

  clearSelection() {
    this.selectedCategories = [];
    this.categorySelected.emit([]);
    this.categoryUrlSelected.emit('');
  }
}
