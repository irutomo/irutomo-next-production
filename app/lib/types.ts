export interface BusinessHour {
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  korean_name?: string;
  cuisine: string;
  location: string;
  rating: number;
  price_range: string;
  image_url: string;
  address: string;
  korean_address?: string;
  description: string;
  korean_description?: string;
  phone_number?: string;
  google_maps_link?: string;
  is_active: boolean;
  images?: string[];
  business_hours?: BusinessHour[];
} 