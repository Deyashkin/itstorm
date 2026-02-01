import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class UrlParamsService {

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  public updateUrlParams(params: { [key: string]: any }): void {
    const currentUrl = this.router.parseUrl(this.router.url);
    const queryParams = { ...currentUrl.queryParams };

    Object.keys(params).forEach(key => {
      const value = params[key];

      if (value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
        delete queryParams[key];
      } else if (Array.isArray(value)) {
        queryParams[key] = value;
      } else {
        queryParams[key] = value.toString();
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '',
      replaceUrl: true
    });
  }

  public getAllParams(): Params {
    const params = this.route.snapshot.queryParams;
    return params;
  }

  public getParam(key: string): string | string[] | null {
    const params = this.getAllParams();
    const value = params[key];

    if (Array.isArray(value)) {
      return value;
    }
    return value || null;
  }

  public getPage(): number {
    const page = this.getParam('page');
    const result = page ? parseInt(page as string, 10) : 1;
    return result;
  }

  public getCategories(): string[] {
    const categories = this.getParam('categories');
    let result: string[] = [];

    if (Array.isArray(categories)) {
      result = categories;
    } else if (typeof categories === 'string' && categories.trim() !== '') {
      result = categories.split(',').filter(cat => cat.trim() !== '');
    }
    return result;
  }
}
