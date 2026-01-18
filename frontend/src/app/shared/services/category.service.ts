import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import type {CategoryInterface} from '../../../types/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryInterface[]> {
    const url = `${this.apiUrl}/categories`;

    return this.http.get<CategoryInterface[]>(url).pipe(
      tap(categories => {
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  getCategoryByUrl(url: string): Observable<CategoryInterface | null> {
    return this.getCategories().pipe(
      map(categories => {
        const category = categories.find(cat => cat.url === url);
        return category || null;
      })
    );
  }

  getCategoryById(id: string): Observable<CategoryInterface | null> {
    return this.getCategories().pipe(
      map(categories => {
        const category = categories.find(cat => cat.id === id);
        return category || null;
      })
    );
  }
}
