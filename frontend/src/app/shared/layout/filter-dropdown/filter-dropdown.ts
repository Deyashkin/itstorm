import {
  Component,
  OnInit,
  HostListener,
  input,
  output,
  signal,
  computed  // Добавлен computed
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

  public readonly selectedCategories = input<string[]>([]);
  public readonly categoriesChange = output<string[]>();

  protected readonly categories = signal<CategoryInterface[]>([]);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isOpen = signal<boolean>(false);

  constructor(private readonly http: HttpClient) {
  }

  public ngOnInit(): void {
    this.loadCategories();
  }

  public loadCategories(): void {
    this.isLoading.set(true);
    const apiUrl = 'http://localhost:3000/api/categories';

    this.http.get<CategoryInterface[]>(apiUrl).subscribe({
      next: (categories) => {
        this.categories.set(categories);          // Исправлено
        this.isLoading.set(false);               // Исправлено
      },
      error: (err) => {
        console.error('Ошибка загрузки категорий:', err);
        this.error.set('Не удалось загрузить категории');  // Исправлено
        this.isLoading.set(false);                         // Исправлено
      }
    });
  }

  public toggleDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen.update(isOpen => !isOpen);  // Исправлено
  }

  @HostListener('document:click')
  protected closeDropdown(): void {
    this.isOpen.set(false);  // Исправлено
  }

  @HostListener('click', ['$event'])
  protected onClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  public toggleCategory(categoryUrl: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    const currentCategories = this.selectedCategories();
    const index = currentCategories.indexOf(categoryUrl);
    let newCategories: string[];

    if (index === -1) {
      newCategories = [...currentCategories, categoryUrl];
    } else {
      newCategories = currentCategories.filter(c => c !== categoryUrl);
    }

    this.categoriesChange.emit(newCategories);
  }

  protected isSelected(categoryUrl: string): boolean {
    return this.selectedCategories().includes(categoryUrl);
  }

  protected getCategoryName(categoryUrl: string): string {
    const category = this.categories().find(c => c.url === categoryUrl);
    return category ? category.name : categoryUrl;
  }

  protected readonly filterButtonText = computed(() => {
    const selected = this.selectedCategories();
    if (selected.length === 0) {
      return 'Фильтр';
    } else if (selected.length === 1) {
      return this.getCategoryName(selected[0]);
    } else {
      return `Фильтр (${selected.length})`;
    }
  });
}
