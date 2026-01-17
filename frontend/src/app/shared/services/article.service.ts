// article.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import type {ArticleInterface} from '../../../types/article.interface';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getArticles(page: number = 1, categories: string[] = [], sortBy: string = 'newest'): Observable<{items: ArticleInterface[], count: number, pages: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', '8')
      .set('_t', Date.now().toString()); // Добавляем timestamp для предотвращения кеширования

    if (categories.length > 0) {
      params = params.set('categories', categories.join(','));
    }

    params = params.set('sort', sortBy);

    const url = `${this.apiUrl}/articles`;
    console.log('Making request to:', url);
    console.log('Params:', params.toString());

    return this.http.get<{items: ArticleInterface[], count: number, pages: number}>(url, {
      params,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).pipe(
      tap(response => {
        console.log('Service received response:', {
          hasItems: !!response.items,
          itemsCount: response.items?.length,
          totalCount: response.count,
          totalPages: response.pages
        });
      }),
      catchError(error => {
        console.error('Service request failed:', error);
        throw error;
      })
    );
  }
}
