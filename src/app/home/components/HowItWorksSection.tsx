
import { useEffect, useRef, useState } from 'react';

export default function HowItWorksSection() {
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

  const steps = [
    {
      icon: 'ri-file-add-line',
      title: 'Post Your Task',
      description: 'Businesses create quick tasks with clear instructions and set fair compensation.',
      image: 'https://readdy.ai/api/search-image?query=Modern%20task%20creation%20interface%20with%20clean%20form%20design%20and%20professional%20business%20elements%2C%20gradient%20background%20with%20productivity%20icons&width=400&height=300&seq=step-1&orientation=landscape',
      delay: 0
    },
    {
      icon: 'ri-user-star-line',
      title: 'Complete Work',
      description: 'Earners pick from available tasks, complete them efficiently, and submit proof of completion.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20freelancer%20working%20on%20laptop%20with%20task%20completion%20interface%2C%20modern%20workspace%20with%20success%20indicators%20and%20progress%20bars&width=400&height=300&seq=step-2&orientation=landscape',
      delay: 200
    },
    {
      icon: 'ri-money-dollar-circle-line',
      title: 'Get Paid Fast',
      description: 'Our seamless escrow system ensures fast, secure payments for completed work.',
      image: 'https://readdy.ai/api/search-image?query=Digital%20payment%20success%20screen%20with%20money%20transfer%20animation%2C%20secure%20payment%20gateway%20interface%20with%20trust%20badges%20and%20currency%20symbols&width=400&height=300&seq=step-3&orientation=landscape',
      delay: 400
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-16 w-72 h-72 bg-gradient-to-r from-indigo-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-400/5 to-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-32"></div>
            <span className="px-6 text-sm font-bold text-purple-600 uppercase tracking-wider bg-white rounded-full py-2 shadow-lg">
              How It Works
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-32"></div>
          </div>
          
          <h2 
            className={`text-5xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Simple. Fast. Secure.
          </h2>
          
          <p 
            className={`text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Three simple steps to start earning or getting work done on MicroWin - designed for maximum efficiency and trust
          </p>
        </div>

        {/* Enhanced Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-1/3 w-1/3 h-px bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-400 transform -translate-y-1/2 opacity-30"></div>
          <div className="hidden lg:block absolute top-1/2 right-1/3 w-1/3 h-px bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-400 transform -translate-y-1/2 opacity-30"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className={`text-center group transition-all duration-1000 relative ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${step.delay}ms` }}
            >
              {/* Enhanced Step Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-6 border border-white/20 hover:border-indigo-200/50 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Step Image */}
                <div className="mb-8 overflow-hidden rounded-2xl relative">
                  <img 
                    src={step.image}
                    alt={step.title}
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Enhanced Icon */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl relative z-10">
                    <i className={`${step.icon} text-4xl text-white`}></i>
                  </div>
                  
                  {/* Floating Animation Elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500 delay-100"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-200"></div>
                  <div className="absolute top-1/2 -right-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 delay-300"></div>
                </div>

                {/* Enhanced Content */}
                <h3 className="text-3xl font-bold text-gray-900 mb-6 group-hover:text-indigo-600 transition-colors duration-500 relative z-10">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-lg max-w-sm mx-auto mb-8 relative z-10">
                  {step.description}
                </p>

                {/* Enhanced Step Number */}
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-2xl group-hover:bg-gradient-to-br group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-600 transition-all duration-500 shadow-lg">
                    {index + 1}
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div 
          className={`text-center mt-20 transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center space-x-6 bg-white/80 backdrop-blur-xl rounded-full px-10 py-6 hover:bg-white/90 transition-all duration-500 shadow-2xl border border-white/20 hover:border-purple-200/50 transform hover:scale-105">
            <span className="text-gray-700 text-lg font-medium">Ready to get started?</span>
            <div className="flex space-x-4">
              <a 
                href="/auth" 
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors duration-300 text-lg"
              >
                Start Earning →
              </a>
              <span className="text-gray-300">|</span>
              <a 
                href="/marketplace" 
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors duration-300 text-lg"
              >
                Post a Task →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}