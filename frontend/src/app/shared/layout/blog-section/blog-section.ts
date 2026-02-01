import {Component, computed, input} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogCardComponent } from '../blog-card/blog-card';
import { CommonModule } from '@angular/common';
import type { ArticleInterface } from '../../../../types/article.interface';

@Component({
  selector: 'app-blog-section',
  standalone: true,
  imports: [
    RouterLink,
    BlogCardComponent,
    CommonModule,
  ],
  templateUrl: './blog-section.html',
  styleUrl: './blog-section.scss',
})

export class BlogSectionComponent {
  public readonly articles = input<ArticleInterface[]>([]);
  public readonly isLoading = input<boolean>(false);
  public readonly error = input<string | null>(null);
  public readonly title = input<string>('Популярные статьи из блога');
  public readonly showLink = input<boolean>(true);

  protected readonly hasArticles = computed(() => this.articles().length > 0);
}
