
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTAVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { y: 100, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // Title animation - word by word
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

      // Button animation
      if (buttonRef.current) {
        gsap.fromTo(buttonRef.current,
          { y: 50, opacity: 0, scale: 0.8 },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            duration: 0.8,
            delay: 0.5,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: buttonRef.current,
              start: "top 85%",
              end: "bottom 15%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Button hover animation
        buttonRef.current.addEventListener('mouseenter', () => {
          gsap.to(buttonRef.current, { scale: 1.05, duration: 0.3, ease: "power2.out" });
        });
        
        buttonRef.current.addEventListener('mouseleave', () => {
          gsap.to(buttonRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
      }

      // Parallax effect for background
      gsap.to(sectionRef.current, {
        backgroundPosition: "50% 100%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 lg:py-40 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://readdy.ai/api/search-image?query=Modern%20professional%20workspace%20with%20multiple%20people%20working%20on%20laptops%20and%20tablets%2C%20collaborative%20environment%2C%20soft%20natural%20lighting%2C%20productivity%20and%20teamwork%2C%20clean%20aesthetic%2C%20business%20meeting%20room%20with%20large%20windows&width=1920&height=1080&seq=cta1&orientation=landscape')`,
        backgroundSize: 'cover',
        backgroundPosition: '50% 0%',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div ref={contentRef}>
            <h2 ref={titleRef} className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Ready to Start Earning?
            </h2>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of freelancers and businesses who trust Micro~Win for their micro-task needs. 
              Start today and experience the future of work.
            </p>
            
            <a 
              ref={buttonRef}
              href="/auth" 
              className="inline-flex items-center px-12 py-4 bg-white text-gray-900 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 group"
            >
              <span className="mr-3">Get Started Now</span>
              <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform duration-300"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-500"></div>
      <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-white/15 rounded-full animate-pulse delay-1500"></div>
    </section>
  );
}
