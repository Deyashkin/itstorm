import {Component, Input, type OnInit} from '@angular/core';
import { RouterLink } from '@angular/router';
import {BlogCardComponent} from '../blog-card/blog-card';
import type {ArticleInterface} from '../../../../types/article.interface';
import {CommonModule} from '@angular/common';

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
  @Input() articles: ArticleInterface[] = [];
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
  @Input() title: string = 'Популярные статьи из блога';
  @Input() showLink: boolean = true;
}
