import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import type { ArticleInterface, CategoryReference } from '../../../types/article.interface';

@Injectable({
  providedIn: 'root'
})


export class ArticleService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  public getArticles(
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

    if (sortBy) {
      params = params.set('sort', sortBy);
    }

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

  public getArticleByUrl(url: string): Observable<ArticleInterface> {
    const apiUrl = `${this.apiUrl}/articles/${url}`;

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

  public getRelatedArticles(articleUrl: string): Observable<ArticleInterface[]> {
    const url = `${this.apiUrl}/articles/related/${articleUrl}`;

    return this.http.get<ArticleInterface[]>(url).pipe(
      tap(articles => {
        console.log('Related articles received:', articles.length);
      }),
      catchError(error => {
        console.error('Failed to fetch related articles:', error);
        throw error;
      })
    );
  }
}
