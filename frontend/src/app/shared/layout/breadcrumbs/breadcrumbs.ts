import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumbs.html',
  styleUrls: ['./breadcrumbs.scss']
})
export class BreadcrumbsComponent {
  @Input() category: any;
  @Input() title: string = '';

  // Метод для получения строкового названия категории
  getCategoryName(): string {
    if (!this.category) return '';

    if (typeof this.category === 'string') {
      return this.category;
    }

    // Если это объект с полями name или category
    if (typeof this.category === 'object') {
      return this.category.name || this.category.category || '';
    }
    return '';
  }
}
