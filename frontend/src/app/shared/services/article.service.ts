import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {tap, catchError, map} from 'rxjs/operators';
import type {ArticleInterface} from '../../../types/article.interface';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getArticles(
    page: number = 1,
    categories: string[] = [],
    sortBy: string = 'newest'
  ): Observable<{items: ArticleInterface[], count: number, pages: number}> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', '8')
      .set('_t', Date.now().toString());

    if (categories.length > 0) {
      categories.forEach(categoryUrl => {
        params = params.append('categories[]', categoryUrl);
      });
    }

    params = params.set('sort', sortBy);

    const url = `${this.apiUrl}/articles`;

    return this.http.get<{items: ArticleInterface[], count: number, pages: number}>(url, {
      params,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }

  getArticlesByCategoryUrl(
    categoryUrl: string,
    page: number = 1,
    sortBy: string = 'newest'
  ): Observable<{items: ArticleInterface[], count: number, pages: number}> {
    return this.getArticles(page, [], sortBy).pipe(
      map(response => {
        const filteredItems = response.items.filter(article => {
          // если у статьи есть массив categoryUrls
          if (article.categoryUrls && Array.isArray(article.categoryUrls)) {
            return article.categoryUrls.includes(categoryUrl);
          }
          // если у статьи есть поле category с URL
          if (article.category && article.category.url === categoryUrl) {
            return true;
          }
          // если у статьи есть массив categories с объектами
          if (article.categories && Array.isArray(article.categories)) {
            return article.categories.some(cat => cat.url === categoryUrl);
          }
          return false;
        });

        const totalCount = filteredItems.length;
        const itemsPerPage = 8;
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        return {
          items: paginatedItems,
          count: totalCount,
          pages: totalPages
        };
      }),
      catchError(error => {
        console.error('Failed to filter articles by category URL:', error);
        throw error;
      })
    );
  }

  getArticleByUrl(url: string): Observable<ArticleInterface> {
    const apiUrl = `${this.apiUrl}/articles/${url}`;
    console.log('Fetching article by URL:', apiUrl);

    return this.http.get<ArticleInterface>(apiUrl).pipe(
      tap(article => {
        console.log('Article received:', article.title);
      }),
      catchError(error => {
        console.error('Failed to fetch article:', error);
        throw error;
      })
    );
  }
}
