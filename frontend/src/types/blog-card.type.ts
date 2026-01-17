export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tag: string;
  imageUrl: string;
  readTime?: string;
  date?: string;
  link?: string;
}
