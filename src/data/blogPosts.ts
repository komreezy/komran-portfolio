export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
}
