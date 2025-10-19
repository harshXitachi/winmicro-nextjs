
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrandsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        const words = titleRef.current.textContent?.split(' ') || [];
        titleRef.current.innerHTML = words.map(word => `<span class="inline-block">${word}</span>`).join(' ');
        
        const spans = titleRef.current.querySelectorAll('span');
        gsap.fromTo(spans,
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.6, 
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: titleRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // Scrolling brands animation
      if (scrollRef.current) {
        const brands = scrollRef.current.children;
        
        // Initial setup
        gsap.set(brands, { opacity: 0, y: 30 });
        
        // Animate brands in
        gsap.to(brands, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: scrollRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        });

        // Continuous scroll animation
        gsap.to(scrollRef.current, {
          x: "-50%",
          duration: 30,
          repeat: -1,
          ease: "none"
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const brands = [
    { name: "TaskRabbit", logo: "https://readdy.ai/api/search-image?query=TaskRabbit%20logo%20modern%20minimalist%20design%20clean%20white%20background%20professional%20brand%20identity&width=120&height=60&seq=brand1&orientation=landscape" },
    { name: "Upwork", logo: "https://readdy.ai/api/search-image?query=Upwork%20logo%20modern%20minimalist%20design%20clean%20white%20background%20professional%20brand%20identity&width=120&height=60&seq=brand2&orientation=landscape" },
    { name: "Fiverr", logo: "https://readdy.ai/api/search-image?query=Fiverr%20logo%20modern%20minimalist%20design%20clean%20white%20background%20professional%20brand%20identity&width=120&height=60&seq=brand3&orientation=landscape" },
    { name: "Freelancer", logo: "https://readdy.ai/api/search-image?query=Freelancer%20logo%20modern%20minimalist%20design%20clean%20white%20background%20professional%20brand%20identity&width=120&height=60&seq=brand4&orientation=landscape" },
    { name: "99designs", logo: "https://readdy.ai/api/search-image?query=99designs%20logo%20modern%20minimalist%20design%20clean%20white%20background%20professional%20brand%20identity&width=120&height=60&seq=brand5&orientation=landscape" },
    { name: "Toptal", logo: "https://readdy.ai/api/search-image?query=Toptal%20logo%20modern%20minimalist%20design%20clean%20white%20background%20professional%20brand%20identity&width=120&height=60&seq=brand6&orientation=landscape" },
    { name: "Guru", logo: "https://readdy.ai/api/search-image?query=Guru%20logo%20modern%20minimalist%20design%20clean%20white%20background%20professional%20brand%20identity&width=120&height=60&seq=brand7&orientation=landscape" },
    { name: "PeoplePerHour", logo: "https://readdy.ai/api/search-image?query=PeoplePerHour%20logo%20modern%20minimalist%20design%20clean%20white%20background%20professional%20brand%20identity&width=120&height=60&seq=brand8&orientation=landscape" }
  ];

  return (
    <section ref={sectionRef} id="section-brands" className="py-20 lg:py-32 bg-white">
      <div className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 ref={titleRef} className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Trusted by leading platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of users who trust Micro~Win for their micro-task needs
            </p>
          </div>

          {/* Scrolling Brands */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
            
            <div ref={scrollRef} className="flex items-center space-x-16 whitespace-nowrap">
              {/* First set of brands */}
              {brands.map((brand, index) => (
                <div key={`first-${index}`} className="flex-shrink-0 flex items-center justify-center w-32 h-16 grayscale hover:grayscale-0 transition-all duration-300">
                  <img 
                    src={brand.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {brands.map((brand, index) => (
                <div key={`second-${index}`} className="flex-shrink-0 flex items-center justify-center w-32 h-16 grayscale hover:grayscale-0 transition-all duration-300">
                  <img 
                    src={brand.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
