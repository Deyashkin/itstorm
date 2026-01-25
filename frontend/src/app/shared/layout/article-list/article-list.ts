import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogCardComponent } from '../blog-card/blog-card';
import type { ArticleInterface } from '../../../../types/article.interface';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, BlogCardComponent],
  templateUrl: './article-list.html',
  styleUrls: ['./article-list.scss']
})

export class ArticleListComponent {
  @Input() articles: ArticleInterface[] = [];
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
}
