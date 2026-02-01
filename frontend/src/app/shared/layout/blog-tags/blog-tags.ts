import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  type OnInit,
  signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CategoryService} from '../../services/category.service';
import type {CategoryInterface} from '../../../../types/category.interface';

@Component({
  selector: 'app-blog-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-tags.html',
  styleUrl: './blog-tags.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogTagsComponent implements OnInit {
  public readonly selectedCategories = input<string[]>([]);
  public readonly categoriesChange = output<string[]>();

  private readonly categories = signal<CategoryInterface[]>([]);

  private readonly categoryService = inject(CategoryService);

  public ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('Ошибка загрузки категорий в blog-tags:', err);
      }
    });
  }

  protected getCategoryName(categoryUrl: string): string {
    if (!categoryUrl) return '';
    const category = this.categories().find(c => c.url === categoryUrl);

    if (category) {
      return category.name;
    }

    return categoryUrl;
  }

  protected removeCategory(categoryUrl: string) {
    const newCategories = this.selectedCategories().filter(c => c !== categoryUrl);
    this.categoriesChange.emit(newCategories);
  }

  public clearAll() {
    this.categoriesChange.emit([]);
  }
}
