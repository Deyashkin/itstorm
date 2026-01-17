import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ArticleService} from '../../services/article.service';
import {CommonModule} from '@angular/common';
import {BlogCardComponent} from '../blog-card/blog-card';
import type {ArticleInterface} from '../../../../types/article.interface';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, BlogCardComponent],
  templateUrl: './article-list.html',
  styleUrls: ['./article-list.scss']
})

export class ArticleListComponent implements OnInit {
  @Input() articles: ArticleInterface[] = [];
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;




  ngOnInit(): void {
    // this.loadArticles();
  }

  // loadArticles(): void {
  //   this.isLoading = true;
  //   this.error = null;
  //
  //   this.articleService.getArticles(1, []).subscribe({
  //     next: (response) => {
  //
  //       if (response && response.items) {
  //         this.articles = response.items;
  //
  //         if (this.articles.length > 0) {
  //           console.log('First article details:', {
  //             title: this.articles[0].title,
  //             image: this.articles[0].image,
  //             category: this.articles[0].category,
  //             id: this.articles[0].id
  //           });
  //         }
  //       } else {
  //         this.error = 'Нет данных для отображения';
  //       }
  //       this.isLoading = false;
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       this.error = 'Ошибка при загрузке статей';
  //       this.isLoading = false;
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }
}
