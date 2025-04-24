export interface JapanInfo {
  id: string;
  title: string;
  korean_title?: string;
  description: string;
  korean_description?: string;
  image_url: string;
  images?: string[];
  content: string;
  korean_content?: string;
  tags?: string[];
  location?: string;
  is_popular?: boolean;
  published_at?: string;
  updated_at?: string;
  author?: string;
  views?: number;
} 