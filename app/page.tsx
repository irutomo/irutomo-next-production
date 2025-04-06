import { HeroSection } from '@/components/hero-section';
import { CategoryButtons } from '@/components/category-buttons';
import { PopularRestaurants } from '@/components/popular-restaurants';
import { ServiceFeatures } from '@/components/service-features';
import { CustomerReviews } from '@/components/customer-reviews';
import { CtaBanner } from '@/components/cta-banner';

export default function Home() {
  return (
    <div className="pb-20">
      <HeroSection />
      <CategoryButtons />
      
      <div className="h-px bg-gray-200 mx-4 my-6"></div>
      
      <PopularRestaurants />
      
      <div className="h-px bg-gray-200 mx-4 my-6"></div>
      
      <ServiceFeatures />
      
      <div className="h-px bg-gray-200 mx-4 my-6"></div>
      
      <CustomerReviews />
      
      <CtaBanner />
    </div>
  );
} 