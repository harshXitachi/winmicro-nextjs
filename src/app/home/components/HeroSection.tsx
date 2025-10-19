
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title animation - word by word
      if (titleRef.current) {
        const titles = titleRef.current.querySelectorAll('h1, h2, h3');
        titles.forEach((title, index) => {
          const words = title.textContent?.split(' ') || [];
          title.innerHTML = words.map(word => `<span class="inline-block">${word}</span>`).join(' ');
          
          const spans = title.querySelectorAll('span');
          gsap.fromTo(spans,
            { y: 100, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 0.8, 
              stagger: 0.1, 
              delay: index * 0.3 + 0.5,
              ease: "power3.out" 
            }
          );
        });
      }

      // Subtitle animation
      gsap.fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 1.5, ease: "power3.out" }
      );

      // Button animation
      gsap.fromTo(buttonRef.current,
        { y: 50, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, delay: 1.8, ease: "back.out(1.7)" }
      );

      // Images animation - circular motion
      if (imagesRef.current) {
        const images = imagesRef.current.querySelectorAll('.hero-image');
        
        images.forEach((image, index) => {
          // Initial animation
          gsap.fromTo(image,
            { scale: 0, rotation: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 1, 
              delay: 2 + index * 0.1, 
              ease: "back.out(1.7)" 
            }
          );

          // Continuous rotation
          gsap.to(image, {
            rotation: 360,
            duration: 20 + index * 5,
            repeat: -1,
            ease: "none"
          });

          // Floating animation
          gsap.to(image, {
            y: "+=20",
            duration: 3 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
          });
        });
      }

      // Parallax effect for images
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          if (imagesRef.current) {
            const images = imagesRef.current.querySelectorAll('.hero-image');
            images.forEach((image, index) => {
              const speed = 0.5 + index * 0.1;
              gsap.to(image, {
                y: self.progress * 100 * speed,
                duration: 0.3,
                ease: "power2.out"
              });
            });
          }
        }
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-white">
      {/* Padding Top */}
      <div className="pt-32 lg:pt-40"></div>
      
      <div className="px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Headings */}
          <div ref={titleRef} className="text-center mb-8">
            <h1 className="text-6xl lg:text-8xl xl:text-9xl font-bold text-gray-900 leading-none mb-4">
              Earn Money.
            </h1>
            
            <h2 className="text-6xl lg:text-8xl xl:text-9xl font-bold text-gray-900 leading-none mb-4">
              Get Work Done.
            </h2>
            
            <h3 className="text-6xl lg:text-8xl xl:text-9xl font-bold text-gray-900 leading-none">
              Anytime, Anywhere.
            </h3>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-12">
            <p ref={subtitleRef} className="text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto">
              A micro-task platform, ready to serve — always.
            </p>
            
            <div className="mt-8">
              <a 
                ref={buttonRef}
                href="#section-brands" 
                className="button-dark inline-block relative overflow-hidden group"
              >
                <div className="relative z-10 px-8 py-4 bg-gray-900 text-white rounded-full transition-all duration-300 group-hover:bg-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                  <span className="relative z-10 font-medium">Learn more</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Padding Bottom */}
      <div className="pb-32 lg:pb-40"></div>

      {/* Hero Images Grid - Enhanced Circular Animation */}
      <div ref={imagesRef} className="absolute inset-0 pointer-events-none">
        {/* Image 1 */}
        <div className="hero-image absolute top-20 left-10 w-32 h-48 rounded-2xl overflow-hidden opacity-80 transform">
          <img 
            src="https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef8df89b0b2f2f210e008_Close-up%20of%20Person%20in%20Gray%20Puffer%20Jacket.webp"
            alt="Person working"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image 2 */}
        <div className="hero-image absolute top-32 right-20 w-28 h-20 rounded-2xl overflow-hidden opacity-70 transform">
          <img 
            src="https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef8e963b2e649a554f979_Minimalist%20Card%20Scene.webp"
            alt="Task card"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image 3 */}
        <div className="hero-image absolute top-1/2 left-1/4 w-20 h-32 rounded-2xl overflow-hidden opacity-75 transform">
          <img 
            src="https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef9e52ad60d7172d49d1c_Close-Up%20Knitwear%20Duo.webp"
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image 4 */}
        <div className="hero-image absolute bottom-1/3 left-16 w-40 h-28 rounded-2xl overflow-hidden opacity-60 transform">
          <img 
            src="https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef915f8608f8600d6aabd_Presentation_Hall_Mockup-1170x780.webp"
            alt="Presentation"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image 5 */}
        <div className="hero-image absolute bottom-40 right-1/4 w-32 h-24 rounded-2xl overflow-hidden opacity-70 transform">
          <img 
            src="https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef92c76e08a8ae2906637_Dynamic%20Motion%20Blur.webp"
            alt="Dynamic work"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image 6 */}
        <div className="hero-image absolute bottom-20 left-1/3 w-36 h-24 rounded-2xl overflow-hidden opacity-65 transform">
          <img 
            src="https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef96bad8d4380aa468d75_Image002-1170x780.webp"
            alt="Technology"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image 7 */}
        <div className="hero-image absolute top-1/3 right-10 w-24 h-24 rounded-full overflow-hidden opacity-60">
          <img 
            src="https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef9b37e069a32bfaff8d6_Smartwatch%20Close-Up%20(1).webp"
            alt="Smart device"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image 8 */}
        <div className="hero-image absolute bottom-32 right-16 w-28 h-40 rounded-2xl overflow-hidden opacity-75 transform">
          <img 
            src="https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/685041aa9addc12d7f717a71_AI%20Shopping%20Bag%20on%20Turf.webp"
            alt="Shopping"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Location Labels */}
      <div className="absolute bottom-8 left-0 right-0 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
            <span>Global</span>
          </div>
          <span>©2025</span>
        </div>
      </div>
    </section>
  );
}
