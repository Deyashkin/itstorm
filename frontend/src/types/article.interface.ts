export interface ArticleInterface {
  id: string;
  title: string;
  description?: string;
  image: string;
  date: string;
  url: string;
  text?: string;

  category?: string | CategoryReference;

  categoryUrls?: string[];
  categories?: CategoryReference[];
}

export interface CategoryReference {
  id?: string;
  name?: string;
  url?: string;
  category?: string;
}

// export interface ArticlesResponse {
//   count: number;
//   pages: number;
//   items: ArticleInterface[];
// }
