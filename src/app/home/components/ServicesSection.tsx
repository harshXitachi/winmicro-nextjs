
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation - word by word reveal
      if (titleRef.current) {
        const words = titleRef.current.textContent?.split(' ') || [];
        titleRef.current.innerHTML = words.map(word => `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`).join(' ');
        
        const wordSpans = titleRef.current.querySelectorAll('span span');
        gsap.fromTo(wordSpans,
          { y: '100%' },
          { 
            y: '0%', 
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

      // Services animation
      if (servicesRef.current) {
        const services = servicesRef.current.querySelectorAll('.service-item');
        
        services.forEach((service, index) => {
          const icon = service.querySelector('.service-icon');
          const title = service.querySelector('.service-title');
          const description = service.querySelector('.service-description');
          
          // Initial setup
          gsap.set([icon, title, description], { opacity: 0, y: 50 });
          
          // Animate in sequence
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: service,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none reverse"
            }
          });
          
          tl.to(icon, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" })
            .to(title, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
            .to(description, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4");

          // Hover animations
          service.addEventListener('mouseenter', () => {
            gsap.to(icon, { scale: 1.1, rotation: 5, duration: 0.3, ease: "power2.out" });
            gsap.to(service, { y: -10, duration: 0.3, ease: "power2.out" });
          });
          
          service.addEventListener('mouseleave', () => {
            gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3, ease: "power2.out" });
            gsap.to(service, { y: 0, duration: 0.3, ease: "power2.out" });
          });
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const services = [
    {
      icon: "ri-user-line",
      title: "For Freelancers",
      description: "Find quick tasks that match your skills. Earn money on your schedule with flexible micro-tasks from verified clients."
    },
    {
      icon: "ri-building-line",
      title: "For Businesses",
      description: "Get small tasks completed quickly by skilled professionals. Scale your operations without long-term commitments."
    },
    {
      icon: "ri-shield-check-line",
      title: "Secure Payments",
      description: "Protected transactions with escrow system. Get paid safely and on time for every completed task."
    },
    {
      icon: "ri-time-line",
      title: "24/7 Support",
      description: "Round-the-clock customer support to help you with any questions or issues you might encounter."
    },
    {
      icon: "ri-star-line",
      title: "Quality Assurance",
      description: "Rating system and quality checks ensure high standards for all tasks and service providers."
    },
    {
      icon: "ri-global-line",
      title: "Global Network",
      description: "Connect with clients and freelancers worldwide. Access opportunities from anywhere, anytime."
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-white">
      <div className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 ref={titleRef} className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Why Choose Micro~Win
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in the micro-task economy
            </p>
          </div>

          {/* Services Grid */}
          <div ref={servicesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="service-item group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="service-icon w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <i className={`${service.icon} text-2xl text-blue-600 group-hover:text-white transition-colors duration-300`}></i>
                </div>
                
                <h3 className="service-title text-xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                
                <p className="service-description text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
