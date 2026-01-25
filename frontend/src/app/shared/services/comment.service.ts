import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CommentInterface, CommentsResponseInterface } from '../../../types/comment.interface';
import { catchError } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }

  getComments(articleId: string, offset: number = 0, limit: number = 3): Observable<CommentsResponseInterface> {
    const params = new HttpParams()
      .set('article', articleId)
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<CommentsResponseInterface>(`${this.apiUrl}/comments`, { params });
  }

  // getTotalCommentsCount(articleId: string): Observable<{ count: number }> {
  //   return this.http.get<{ count: number }>(`${this.apiUrl}/comments/count`, {
  //     params: { article: articleId }
  //   });
  // }

  createComment(articleId: string, text: string): Observable<CommentInterface> {
    return this.http.post<CommentInterface>(`${this.apiUrl}/comments`, {
      article: articleId,
      text
    });
  }

  likeComment(commentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/apply-action`, {
      action: 'like'
    });
  }

  dislikeComment(commentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/apply-action`, {
      action: 'dislike'
    });
  }

  getCommentActions(commentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/comments/${commentId}/actions`);
  }

  getArticleCommentActions(articleId: string): Observable<any> {
    const params = new HttpParams().set('articleId', articleId);
    return this.http.get(`${this.apiUrl}/comments/article-comment-actions`, { params });
  }

  getCurrentUser(): Observable<{ isAuthenticated: boolean; user?: any }> {
    return this.http.get<{ isAuthenticated: boolean; user?: any }>(`${this.apiUrl}/auth/me`);
  }

  reportComment(commentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/apply-action`, {
      action: 'violate'
    }).pipe(
      catchError(this.handleError)
    );
  }

}
