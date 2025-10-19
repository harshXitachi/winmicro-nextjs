
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation - word by word
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

      // Text content animation
      if (textRef.current) {
        const paragraphs = textRef.current.querySelectorAll('p');
        gsap.fromTo(paragraphs,
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: textRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // Image animation with parallax
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          { scale: 0.8, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Parallax effect
        gsap.to(imageRef.current, {
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-white">
      <div className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 ref={titleRef} className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
                We are Micro~Win™
              </h2>
              
              <div ref={textRef} className="space-y-6">
                <p className="text-xl text-gray-600 leading-relaxed">
                  A revolutionary micro-task platform that connects skilled individuals with businesses 
                  and entrepreneurs who need quick, reliable solutions.
                </p>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Whether you're looking to earn extra income by completing small tasks or need 
                  professional help with your projects, Micro~Win makes it simple, fast, and secure.
                </p>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Our platform is built on trust, efficiency, and the belief that every task, 
                  no matter how small, deserves professional attention.
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div ref={imageRef} className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100">
                <img 
                  src="https://readdy.ai/api/search-image?query=Professional%20diverse%20team%20working%20together%20on%20laptops%20and%20tablets%20in%20modern%20office%20space%2C%20collaborative%20workspace%2C%20productivity%20and%20teamwork%2C%20clean%20modern%20aesthetic%2C%20natural%20lighting%2C%20business%20professionals%20focused%20on%20tasks&width=600&height=750&seq=about1&orientation=portrait"
                  alt="Micro~Win team working together"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating stats */}
              <div className="absolute -top-8 -right-8 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-3xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
