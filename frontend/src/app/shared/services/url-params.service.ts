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
        console.log(`updateUrlParams - удаляем параметр ${key}`);
        delete queryParams[key];
      } else if (Array.isArray(params[key])) {
        // ПРЕОБРАЗУЕМ МАССИВ В СТРОКУ С РАЗДЕЛИТЕЛЯМИ
        queryParams[key] = params[key].join(',');
        console.log(`updateUrlParams - устанавливаем строку для ${key}:`, queryParams[key]);
      } else {
        queryParams[key] = params[key].toString();
        console.log(`updateUrlParams - устанавливаем значение для ${key}:`, params[key]);
      }
    });

    console.log('updateUrlParams - итоговые параметры URL:', queryParams);

    // Обновляем URL без перезагрузки страницы
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    console.log('updateUrlParams - URL обновлен');
  }

  // Получить все параметры из URL
  getAllParams(): Params {
    const params = this.route.snapshot.queryParams;
    console.log('getAllParams - текущие параметры URL:', params);
    return params;
  }

  // Получить конкретный параметр
  getParam(key: string): string | string[] | null {
    const params = this.getAllParams();
    const value = params[key];

    console.log(`getParam - получен параметр ${key}:`, value);

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

    console.log(`getCategories - категории:`, result);
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
