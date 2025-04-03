import { HeroSection } from '@/components/hero-section';
import { ImageGallery } from '@/components/image-gallery';
import { FeaturesSection } from '@/components/features-section';
import { UsageSteps } from '@/components/usage-steps';
import { PriceOptions } from '@/components/price-options';
import { Cautions } from '@/components/cautions';
import { ReviewsSection } from '@/components/reviews-section';
import { PricingSection } from '@/components/pricing-section';
import { CTASection } from '@/components/cta-section';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ImageGallery />
      <FeaturesSection />
      <UsageSteps />
      <PriceOptions />
      <Cautions />
      <ReviewsSection />
      <PricingSection />
      <CTASection />
    </div>
  );
} 