import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input, output, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-pagination.html',
  styleUrl: './blog-pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogPaginationComponent {

  public readonly currentPage = input<number>(1);
  public readonly totalPages = input<number>(1);
  public readonly totalItems = input<number>(0);
  public readonly itemsPerPage = input<number>(8);

  public readonly pageChange = output<number>();

  protected readonly pages = computed(() => {
    const currentPage = this.currentPage();
    const totalPages = this.totalPages();
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  protected goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  protected   goToPrev() {
    this.goToPage(this.currentPage() - 1);
  }

  protected goToNext() {
    this.goToPage(this.currentPage() + 1);
  }
}
