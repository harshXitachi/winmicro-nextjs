
import { useEffect, useRef, useState } from 'react';

export default function CategoriesSection() {
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

  const categories = [
    {
      icon: 'ri-smartphone-line',
      title: 'App Testing',
      description: 'Test mobile apps and websites for functionality and user experience',
      taskCount: '2,500+',
      avgPay: '$5-15',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'ri-file-text-line',
      title: 'Data Entry',
      description: 'Input and organize data with accuracy and attention to detail',
      taskCount: '1,800+',
      avgPay: '$3-10',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'ri-questionnaire-line',
      title: 'Surveys',
      description: 'Share your opinions and insights through market research surveys',
      taskCount: '3,200+',
      avgPay: '$2-8',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: 'ri-heart-line',
      title: 'Social Media Engagement',
      description: 'Like, share, and engage with social media content authentically',
      taskCount: '4,100+',
      avgPay: '$1-5',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Content Moderation',
      description: 'Review and moderate content to ensure community guidelines',
      taskCount: '900+',
      avgPay: '$8-20',
      color: 'from-orange-500 to-amber-500'
    },
    {
      icon: 'ri-search-line',
      title: 'Research Tasks',
      description: 'Conduct online research and compile information on various topics',
      taskCount: '1,200+',
      avgPay: '$10-25',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-white">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-24"></div>
            <span className="px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Task Categories
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-24"></div>
          </div>
          
          <h2 
            className={`text-4xl lg:text-6xl font-bold text-gray-900 mb-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Choose Your Path
          </h2>
          
          <p 
            className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Explore diverse task categories and find opportunities that match your skills
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`group cursor-pointer transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 border border-gray-100 hover:border-gray-200">
                {/* Icon */}
                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <i className={`${category.icon} text-2xl text-white`}></i>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {category.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {category.description}
                </p>

                {/* Stats */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500">Available Tasks</div>
                    <div className="font-bold text-gray-900">{category.taskCount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Avg. Pay</div>
                    <div className="font-bold text-green-600">{category.avgPay}</div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="mt-6 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
                  <span className="text-sm font-medium">Browse tasks</span>
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div 
          className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Don't see your skill? No problem!
            </h3>
            <p className="text-gray-600 mb-6">
              New task categories are added regularly. Join now and get notified when tasks matching your expertise become available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/browse-all-tasks" 
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
              >
                Browse All Tasks
              </a>
              <a 
                href="/suggest-category" 
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 rounded-full font-medium border border-gray-200 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
              >
                Suggest a Category
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
