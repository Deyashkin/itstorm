import {
  Component,
  Input,
  Output,
  EventEmitter,
  type OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import type { CategoryInterface } from '../../../../types/category.interface';

@Component({
  selector: 'app-blog-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-tags.html',
  styleUrl: './blog-tags.scss',
})
export class BlogTagsComponent implements OnInit {
  @Input() selectedCategories: string[] = [];
  @Output() categoriesChange = new EventEmitter<string[]>();

  categories: CategoryInterface[] = [];

  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Ошибка загрузки категорий в blog-tags:', err);
      }
    });
  }

  getCategoryName(categoryUrl: string): string {
    if (!categoryUrl) return '';
    const category = this.categories.find(c => c.url === categoryUrl);

    if (category) {
      return category.name;
    }

    return categoryUrl;
  }

  removeCategory(categoryUrl: string) {
    const newCategories = this.selectedCategories.filter(c => c !== categoryUrl);
    this.categoriesChange.emit(newCategories);
  }

  clearAll() {
    this.categoriesChange.emit([]);
  }

  toggleCategory(categoryUrl: string): void {
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
}
