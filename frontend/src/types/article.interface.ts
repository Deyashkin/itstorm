export interface ArticleInterface {
  id: string;
  title: string;
  description?: string;
  image: string;
  date: string;
  url: string;

  text?: string;

  // Возможные структуры категорий:
  categoryUrls?: string[]; // Массив URL категорий
  category?: CategoryReference; // Ссылка на одну категорию
  categories?: CategoryReference[]; // Массив категорий
}

export interface CategoryReference {
  id?: string;
  name?: string;
  url?: string;
  // или если категория - это просто строка (URL)
}

// Или используйте union type:
export type ArticleCategory = string | CategoryReference | (string | CategoryReference)[];

export interface ArticlesResponse {
  count: number;
  pages: number;
  items: ArticleInterface[];
}
