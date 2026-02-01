import { Component, Input } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import type { ArticleInterface } from "../../../../types/article.interface";

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.scss',
})

export class BlogCardComponent {
  @Input() article!: ArticleInterface;

  protected get imageUrl(): string {
    if (!this.article || !this.article.image) {
      return 'assets/images/placeholder.jpg';
    }

    const image = this.article.image;

    if (image.startsWith('http')) {
      return image;
    }

    return `assets/images/blog/${image}`;
  }
}
