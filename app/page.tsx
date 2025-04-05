import { KoreanFoodHero } from '@/components/korean-food-hero';
import { CategoryButtons } from '@/components/category-buttons';
import { PopularRestaurants } from '@/components/popular-restaurants';
import { ServiceFeatures } from '@/components/service-features';

export default function Home() {
  return (
    <div className="min-h-screen">
      <KoreanFoodHero />
      <CategoryButtons />
      <PopularRestaurants />
      <ServiceFeatures />
    </div>
  );
} 