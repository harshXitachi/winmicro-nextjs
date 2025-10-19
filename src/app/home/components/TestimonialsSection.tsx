
import { useEffect, useRef, useState } from 'react';

export default function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Freelance Worker',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20woman%20smiling%20confidently%20in%20modern%20workspace%20clean%20portrait%20photography%20with%20soft%20lighting%20and%20minimal%20background&width=150&height=150&seq=testimonial-1&orientation=squarish',
      content: 'Microwin has completely changed how I earn money online. The tasks are clear, payments are fast, and I can work whenever I want. I\'ve earned over $2,000 in just three months!',
      rating: 5,
      earnings: '$2,000+ earned'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Small Business Owner',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Hispanic%20businessman%20in%20modern%20office%20setting%20confident%20smile%20clean%20corporate%20portrait%20with%20professional%20lighting&width=150&height=150&seq=testimonial-2&orientation=squarish',
      content: 'As a startup founder, Microwin has been invaluable for getting quick tasks done without hiring full-time staff. The quality of work is excellent and the turnaround time is amazing.',
      rating: 5,
      savings: '60% cost savings'
    },
    {
      name: 'Emily Johnson',
      role: 'Marketing Manager',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20blonde%20woman%20in%20business%20attire%20warm%20smile%20modern%20office%20background%20clean%20corporate%20headshot%20photography&width=150&height=150&seq=testimonial-3&orientation=squarish',
      content: 'We use Microwin for content moderation and social media tasks. The platform is reliable, workers are skilled, and it has streamlined our workflow significantly.',
      rating: 5,
      efficiency: '3x faster delivery'
    },
    {
      name: 'David Kim',
      role: 'College Student',
      avatar: 'https://readdy.ai/api/search-image?query=Young%20Asian%20male%20student%20smiling%20casual%20but%20professional%20appearance%20modern%20university%20or%20workspace%20background%20natural%20lighting&width=150&height=150&seq=testimonial-4&orientation=squarish',
      content: 'Perfect for earning extra money between classes! The app testing tasks are fun and pay well. I\'ve been able to cover my textbook expenses and more.',
      rating: 5,
      earnings: '$800+ monthly'
    },
    {
      name: 'Lisa Thompson',
      role: 'E-commerce Owner',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20woman%20entrepreneur%20with%20confident%20expression%20modern%20business%20environment%20clean%20portrait%20with%20professional%20styling&width=150&height=150&seq=testimonial-5&orientation=squarish',
      content: 'Microwin helps us handle data entry and product research efficiently. The escrow system gives us confidence, and the quality of work consistently exceeds expectations.',
      rating: 5,
      productivity: '5x productivity boost'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 
            className={`text-4xl lg:text-6xl font-bold text-gray-900 mb-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Trusted by Workers. Loved by Businesses.
          </h2>
          
          <p 
            className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Real stories from our community of successful earners and satisfied businesses
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div 
          className={`relative transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl mx-4">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-4 ring-blue-100">
                          <img 
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-center lg:text-left">
                        {/* Stars */}
                        <div className="flex justify-center lg:justify-start space-x-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <i key={i} className="ri-star-fill text-yellow-400 text-xl"></i>
                          ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-6 italic">
                          "{testimonial.content}"
                        </blockquote>

                        {/* Author Info */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                            <div className="text-gray-500">{testimonial.role}</div>
                          </div>

                          {/* Achievement Badge */}
                          <div className="mt-4 lg:mt-0">
                            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                              <i className="ri-trophy-line"></i>
                              <span>
                                {testimonial.earnings || testimonial.savings || testimonial.efficiency || testimonial.productivity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            >
              <i className="ri-arrow-left-line text-gray-600"></i>
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            >
              <i className="ri-arrow-right-line text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
