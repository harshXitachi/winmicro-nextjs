'use client';

import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import HeroSection from './home/components/HeroSection';
import BrandsSection from './home/components/BrandsSection';
import AboutSection from './home/components/AboutSection';
import WorkSection from './home/components/WorkSection';
import ServicesSection from './home/components/ServicesSection';
import CTAVideoSection from './home/components/CTAVideoSection';
import HowItWorksSection from './home/components/HowItWorksSection';
import BlogSection from './home/components/BlogSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <BrandsSection />
        <AboutSection />
        <WorkSection />
        <ServicesSection />
        <HowItWorksSection />
        <BlogSection />
        <CTAVideoSection />
      </main>
      <Footer />
    </div>
  );
}
