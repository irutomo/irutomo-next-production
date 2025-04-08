export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  description?: string;
  image_url?: string;
  images?: string[] | string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  address?: string;
  cuisine?: string;
  price_range?: string;
  google_maps_link?: string;
  korean_name?: string;
} 