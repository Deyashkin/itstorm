// blog-tags.ts - ОБНОВЛЕННЫЙ ФАЙЛ (убираем всю логику загрузки)
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-tags.html',
  styleUrl: './blog-tags.scss',
})
export class BlogTagsComponent {
  @Input() selectedCategories: string[] = [];
  @Output() categoriesChange = new EventEmitter<string[]>();

  // Только метод для удаления категории
  removeCategory(category: string) {
    const newCategories = this.selectedCategories.filter(c => c !== category);
    this.categoriesChange.emit(newCategories);
  }

  clearAll() {
    this.categoriesChange.emit([]);
  }
}
