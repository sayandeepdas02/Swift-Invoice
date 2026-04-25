import React from 'react';

// Core sections
import HeroSection from '../components/blocks/HeroSection';
import WhySection from '../components/blocks/WhySection';
import FeaturesSection from '../components/blocks/FeaturesSection';
import HowItWorksSection from '../components/blocks/HowItWorksSection';
import PricingSection from '../components/blocks/Pricing2';
import TestimonialsSection from '../components/blocks/TestimonialsSection';
import BottomCTA from '../components/blocks/BottomCTA';
import Footer from '../components/blocks/Footer';
import HatchSeparator from '../components/ui/HatchSeparator';

// Full-width hairline divider — matches border-x column
const Divider = () => (
  <div className="w-full overflow-x-hidden bg-background px-2 sm:px-4 lg:px-[5%]">
    <div className="mx-auto w-full max-w-[1600px] border-x" style={{ borderColor: 'var(--color-line)' }}>
      <HatchSeparator />
    </div>
  </div>
);

const LandingPage = () => (
  <div className="font-sans antialiased text-foreground bg-background selection:bg-brand/20 selection:text-foreground">
    {/* 1. Hero */}
    <HeroSection />

    <Divider />

    {/* 2. Why Swift Invoice? */}
    <WhySection />

    <Divider />

    {/* 3. Features */}
    <FeaturesSection />

    <Divider />

    {/* 4. How it Works */}
    <HowItWorksSection />

    <Divider />

    {/* 5. Pricing */}
    <PricingSection />

    <Divider />

    {/* 6. Testimonials */}
    <TestimonialsSection />

    {/* 7. CTA — full-bleed pink, no divider (natural visual break) */}
    <BottomCTA />

    {/* 8. Footer */}
    <Footer />
  </div>
);

export default LandingPage;
