
import { useEffect, useRef, useState } from 'react';

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ tasks: 0, workers: 0, businesses: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  const finalValues = { tasks: 10000, workers: 5000, businesses: 1000 };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCounters({
        tasks: Math.floor(finalValues.tasks * easeOutQuart),
        workers: Math.floor(finalValues.workers * easeOutQuart),
        businesses: Math.floor(finalValues.businesses * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setCounters(finalValues);
      }
    }, stepDuration);
  };

  const stats = [
    {
      value: counters.tasks,
      suffix: '+',
      label: 'Tasks Completed',
      description: 'Successfully finished projects',
      icon: 'ri-task-line'
    },
    {
      value: counters.workers,
      suffix: '+',
      label: 'Active Workers',
      description: 'Skilled professionals ready to work',
      icon: 'ri-user-star-line'
    },
    {
      value: counters.businesses,
      suffix: '+',
      label: 'Businesses Onboarded',
      description: 'Companies trusting our platform',
      icon: 'ri-building-line'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 
            className={`text-4xl lg:text-6xl font-bold mb-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Trusted by Thousands
          </h2>
          
          <p 
            className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Join a growing community of successful businesses and skilled workers
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center group transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <i className={`${stat.icon} text-3xl text-white`}></i>
                </div>
              </div>

              {/* Counter */}
              <div className="mb-4">
                <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
              </div>

              {/* Label */}
              <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors duration-300">
                {stat.label}
              </h3>
              
              <p className="text-gray-400 leading-relaxed">
                {stat.description}
              </p>

              {/* Decorative Elements */}
              <div className="mt-8 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 delay-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div 
          className={`text-center mt-20 transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 hover:bg-white/20 transition-all duration-300">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Growing every day</span>
          </div>
        </div>
      </div>
    </section>
  );
}
