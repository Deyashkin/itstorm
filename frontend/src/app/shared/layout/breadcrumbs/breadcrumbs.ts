import {Component, computed, input} from '@angular/core';
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

  public readonly category = input<any>(null);
  public readonly title = input<string>('');

  public readonly categoryName = computed(() => {
    const cat = this.category();

    if (!cat) return '';

    if (typeof cat === 'string') {
      return cat;
    }

    if (typeof cat === 'object' && cat !== null) {
      return cat.name || cat.category || '';
    }

    return '';
  });

  public readonly hasCategory = computed(() => {
    return this.categoryName().length > 0;
  });
}
