import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})


export class UrlParamsService {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  // Обновить URL с новыми параметрами
  updateUrlParams(params: { [key: string]: any }): void {
    console.log('updateUrlParams - входные параметры:', params);

    const currentUrl = this.router.parseUrl(this.router.url);
    const queryParams = currentUrl.queryParams;

    console.log('updateUrlParams - текущие параметры URL:', queryParams);

    // Обновляем параметры
    Object.keys(params).forEach(key => {
      console.log(`updateUrlParams - обработка параметра ${key}:`, params[key]);

      if (params[key] === null || params[key] === undefined || params[key] === '' ||
        (Array.isArray(params[key]) && params[key].length === 0)) {
        delete queryParams[key];
      } else if (Array.isArray(params[key])) {
        queryParams[key] = params[key].join(',');
      } else {
        queryParams[key] = params[key].toString();
      }
    });

    // Обновляем URL без перезагрузки страницы
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // Получить все параметры из URL
  getAllParams(): Params {
    const params = this.route.snapshot.queryParams;
    return params;
  }

  // Получить конкретный параметр
  getParam(key: string): string | string[] | null {
    const params = this.getAllParams();
    const value = params[key];

    if (Array.isArray(value)) {
      return value;
    }
    return value || null;
  }

  // Получить номер страницы
  getPage(): number {
    const page = this.getParam('page');
    const result = page ? parseInt(page as string, 10) : 1;
    console.log(`getPage - номер страницы:`, result);
    return result;
  }

  // Получить выбранные категории
  getCategories(): string[] {
    const categories = this.getParam('categories');
    let result: string[] = [];

    if (Array.isArray(categories)) {
      result = categories;
    } else if (typeof categories === 'string' && categories.trim() !== '') {
      // РАЗБИВАЕМ СТРОКУ ПО ЗАПЯТОЙ И УДАЛЯЕМ ПУСТЫЕ ЗНАЧЕНИЯ
      result = categories.split(',').filter(cat => cat.trim() !== '');
    }
    return result;
  }

  // Получить сортировку
  getSort(): string {
    const sort = this.getParam('sort');
    const result = (sort as string) || 'newest';
    console.log(`getSort - сортировка:`, result);
    return result;
  }
}
