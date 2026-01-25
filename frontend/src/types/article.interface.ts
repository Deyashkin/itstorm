// article.interface.ts
export interface ArticleInterface {
  id: string;
  title: string;
  description?: string;
  image: string;
  date: string;
  url: string;
  text?: string;

  // Упрощаем: категория может быть строкой или объектом
  category?: string | CategoryReference;

  // Для фильтрации
  categoryUrls?: string[];
  categories?: CategoryReference[];
}

export interface CategoryReference {
  id?: string;
  name?: string;
  url?: string;
  // Добавляем category для совместимости
  category?: string;
}

export interface ArticlesResponse {
  count: number;
  pages: number;
  items: ArticleInterface[];
}
