
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        const words = titleRef.current.textContent?.split(' ') || [];
        titleRef.current.innerHTML = words.map(word => `<span class="inline-block">${word}</span>`).join(' ');
        
        const spans = titleRef.current.querySelectorAll('span');
        gsap.fromTo(spans,
          { y: 100, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
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

      // Grid items animation
      if (gridRef.current) {
        const items = gridRef.current.querySelectorAll('.work-item');
        
        items.forEach((item, index) => {
          gsap.fromTo(item,
            { y: 100, opacity: 0, scale: 0.8 },
            { 
              y: 0, 
              opacity: 1, 
              scale: 1,
              duration: 0.8, 
              delay: index * 0.1,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: item,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none reverse"
              }
            }
          );

          // Hover animations
          const image = item.querySelector('.work-image');
          const overlay = item.querySelector('.work-overlay');
          
          item.addEventListener('mouseenter', () => {
            gsap.to(image, { scale: 1.1, duration: 0.6, ease: "power2.out" });
            gsap.to(overlay, { opacity: 1, duration: 0.3, ease: "power2.out" });
          });
          
          item.addEventListener('mouseleave', () => {
            gsap.to(image, { scale: 1, duration: 0.6, ease: "power2.out" });
            gsap.to(overlay, { opacity: 0, duration: 0.3, ease: "power2.out" });
          });
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const projects = [
    {
      title: "Data Entry Solutions",
      category: "Administrative",
      image: "https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef8df89b0b2f2f210e008_Close-up%20of%20Person%20in%20Gray%20Puffer%20Jacket.webp",
      description: "Professional data entry and management services for businesses of all sizes."
    },
    {
      title: "Content Creation",
      category: "Creative",
      image: "https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef8e963b2e649a554f979_Minimalist%20Card%20Scene.webp",
      description: "High-quality content writing, editing, and creative design services."
    },
    {
      title: "Virtual Assistance",
      category: "Support",
      image: "https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef9e52ad60d7172d49d1c_Close-Up%20Knitwear%20Duo.webp",
      description: "Comprehensive virtual assistant services to streamline your workflow."
    },
    {
      title: "Market Research",
      category: "Analytics",
      image: "https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef915f8608f8600d6aabd_Presentation_Hall_Mockup-1170x780.webp",
      description: "In-depth market analysis and research to drive business decisions."
    },
    {
      title: "Social Media Management",
      category: "Marketing",
      image: "https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef92c76e08a8ae2906637_Dynamic%20Motion%20Blur.webp",
      description: "Complete social media strategy and content management services."
    },
    {
      title: "Technical Support",
      category: "Technology",
      image: "https://cdn.prod.website-files.com/684a11845c7dd0b4b7745cd9/684ef96bad8d4380aa468d75_Image002-1170x780.webp",
      description: "Expert technical support and troubleshooting for various platforms."
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-gray-50">
      <div className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 ref={titleRef} className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Our Work
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the diverse range of micro-tasks and services available on our platform
            </p>
          </div>

          {/* Projects Grid */}
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={index} className="work-item group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={project.image}
                      alt={project.title}
                      className="work-image w-full h-full object-cover transition-transform duration-600"
                    />
                    <div className="work-overlay absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                          <i className="ri-arrow-right-line text-xl"></i>
                        </div>
                        <span className="text-sm font-medium">View Details</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {project.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {project.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
