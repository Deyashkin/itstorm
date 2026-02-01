import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CommentInterface, CommentsResponseInterface } from '../../../types/comment.interface';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})


export class CommentService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }

  public getComments(articleId: string, offset: number = 0, limit: number = 3): Observable<CommentsResponseInterface> {
    const params = new HttpParams()
      .set('article', articleId)
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<CommentsResponseInterface>(`${this.apiUrl}/comments`, { params });
  }

  public createComment(articleId: string, text: string): Observable<CommentInterface> {
    return this.http.post<CommentInterface>(`${this.apiUrl}/comments`, {
      article: articleId,
      text
    });
  }

  public likeComment(commentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/apply-action`, {
      action: 'like'
    });
  }

  public dislikeComment(commentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/apply-action`, {
      action: 'dislike'
    });
  }

  public getArticleCommentActions(articleId: string): Observable<any> {
    const params = new HttpParams().set('articleId', articleId);
    return this.http.get(`${this.apiUrl}/comments/article-comment-actions`, { params });
  }

  public reportComment(commentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/apply-action`, {
      action: 'violate'
    }).pipe(
      catchError(this.handleError)
    );
  }
}
