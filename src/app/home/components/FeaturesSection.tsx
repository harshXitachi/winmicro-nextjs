
import { useEffect, useRef, useState } from 'react';

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: 'ri-flashlight-line',
      title: 'Fast Payments',
      description: 'Escrow-based system ensures timely payouts with secure transaction processing.',
      image: 'https://readdy.ai/api/search-image?query=Digital%20payment%20processing%20interface%20with%20secure%20transaction%20symbols%20modern%20fintech%20design%20with%20clean%20gradients%20and%20trust%20indicators&width=400&height=300&seq=feature-1&orientation=landscape'
    },
    {
      icon: 'ri-global-line',
      title: 'Global Access',
      description: 'Work or hire from anywhere in the world with our international platform.',
      image: 'https://readdy.ai/api/search-image?query=World%20map%20with%20connection%20lines%20and%20user%20icons%20representing%20global%20remote%20work%20network%20modern%20visualization%20with%20soft%20colors&width=400&height=300&seq=feature-2&orientation=landscape'
    },
    {
      icon: 'ri-time-line',
      title: 'Flexible Earnings',
      description: 'Earners choose when and how much to work, creating perfect work-life balance.',
      image: 'https://readdy.ai/api/search-image?query=Flexible%20work%20schedule%20visualization%20with%20calendar%20interface%20and%20time%20management%20tools%20modern%20productivity%20design&width=400&height=300&seq=feature-3&orientation=landscape'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Secure & Transparent',
      description: 'Verified tasks, proof-of-work system, and comprehensive anti-fraud protection.',
      image: 'https://readdy.ai/api/search-image?query=Security%20shield%20with%20verification%20checkmarks%20and%20trust%20symbols%20modern%20cybersecurity%20design%20with%20clean%20interface%20elements&width=400&height=300&seq=feature-4&orientation=landscape'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/30 relative overflow-hidden">
      {/* Enhanced Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent w-32"></div>
            <span className="px-6 text-sm font-bold text-indigo-600 uppercase tracking-wider bg-white rounded-full py-2 shadow-lg">
              Why Choose MicroWin
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent w-32"></div>
          </div>
          
          <h2 
            className={`text-5xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Built for Growth, Built for Trust
          </h2>
          
          <p 
            className={`text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Experience the future of task-based work with features designed for success and built with cutting-edge technology
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-4 border border-white/20 hover:border-indigo-200/50">
                {/* Enhanced Feature Image */}
                <div className="mb-8 overflow-hidden rounded-2xl relative">
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Enhanced Icon */}
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                    <i className={`${feature.icon} text-3xl text-white`}></i>
                  </div>
                </div>

                {/* Enhanced Content */}
                <h3 className="text-3xl font-bold text-gray-900 mb-6 group-hover:text-indigo-600 transition-colors duration-500">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  {feature.description}
                </p>

                {/* Enhanced Hover Effect */}
                <div className="flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-0 group-hover:translate-x-4">
                  <span className="text-lg font-semibold">Explore Feature</span>
                  <i className="ri-arrow-right-line ml-3 text-xl"></i>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div 
          className={`text-center mt-20 transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center space-x-6 bg-white/80 backdrop-blur-xl rounded-full px-10 py-6 hover:bg-white/90 transition-all duration-500 shadow-2xl border border-white/20 hover:border-indigo-200/50 transform hover:scale-105">
            <span className="text-gray-700 text-lg font-medium">Ready to experience the future?</span>
            <div className="flex space-x-4">
              <a 
                href="/auth" 
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors duration-300 text-lg"
              >
                Get Started →
              </a>
              <span className="text-gray-300">|</span>
              <a 
                href="/marketplace" 
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors duration-300 text-lg"
              >
                Browse Tasks →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}