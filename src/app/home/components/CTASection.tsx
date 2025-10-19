
import { useEffect, useRef, useState } from 'react';
import Button from '../../../components/base/Button';

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-white">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        <div 
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Left Side - Want to Earn */}
          <div className="group cursor-pointer">
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 p-8 lg:p-12 flex flex-col justify-between transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-white rounded-full"></div>
                <div className="absolute top-1/2 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="ri-money-dollar-circle-line text-3xl text-white"></i>
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Want to Earn?
                </h3>
                
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                  Join thousands of workers earning money by completing simple tasks. 
                  Flexible hours, instant payments, global opportunities.
                </p>
              </div>

              <div className="relative z-10">
                <Button 
                  variant="light" 
                  size="large" 
                  href="/start-earning"
                  className="w-full group-hover:bg-white group-hover:text-blue-600 transition-all duration-300"
                >
                  Start Earning Now
                </Button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Right Side - Need Work Done */}
          <div className="group cursor-pointer">
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-700 p-8 lg:p-12 flex flex-col justify-between transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-20 left-10 w-24 h-24 border-2 border-white rounded-full"></div>
                <div className="absolute top-1/2 left-20 w-16 h-16 border-2 border-white rounded-full"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="ri-briefcase-line text-3xl text-white"></i>
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Need Work Done?
                </h3>
                
                <p className="text-purple-100 text-lg leading-relaxed mb-8">
                  Get tasks completed quickly by skilled professionals. 
                  Post your project, set your budget, receive quality results.
                </p>
              </div>

              <div className="relative z-10">
                <Button 
                  variant="light" 
                  size="large" 
                  href="/post-task"
                  className="w-full group-hover:bg-white group-hover:text-purple-600 transition-all duration-300"
                >
                  Post a Task Today
                </Button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* Bottom Message */}
        <div 
          className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Join the Future of Work
            </h4>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're looking to earn extra income or need tasks completed efficiently, 
              Microwin provides the perfect platform for success.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
