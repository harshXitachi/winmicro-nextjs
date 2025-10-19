
import { useEffect, useRef, useState } from 'react';

export default function BlogSection() {
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

  const blogPosts = [
    {
      title: '5 Tips to Maximize Earnings on Microwin',
      excerpt: 'Learn proven strategies to increase your income and build a successful freelancing career on our platform.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20workspace%20with%20laptop%20showing%20earnings%20dashboard%20and%20productivity%20tools%2C%20modern%20clean%20design%20with%20motivational%20elements%20and%20success%20metrics%20visualization&width=400&height=250&seq=blog-1&orientation=landscape',
      category: 'Earning Tips',
      readTime: '5 min read',
      date: 'Jan 15, 2025',
      author: 'Sarah Mitchell'
    },
    {
      title: 'Why Micro-Tasks are the Future of Work',
      excerpt: 'Explore how the gig economy is evolving and why micro-task platforms are becoming essential for businesses.',
      image: 'https://readdy.ai/api/search-image?query=Futuristic%20workspace%20with%20digital%20interfaces%20showing%20task%20management%20and%20remote%20work%20concepts%2C%20modern%20technology%20visualization%20with%20clean%20aesthetics&width=400&height=250&seq=blog-2&orientation=landscape',
      category: 'Industry Insights',
      readTime: '8 min read',
      date: 'Jan 12, 2025',
      author: 'David Chen'
    },
    {
      title: 'How Businesses Can Scale Faster with Micro-Workers',
      excerpt: 'Discover how smart companies are leveraging micro-task platforms to accelerate growth and reduce operational costs.',
      image: 'https://readdy.ai/api/search-image?query=Business%20growth%20visualization%20with%20charts%20graphs%20and%20team%20collaboration%20elements%2C%20professional%20corporate%20design%20with%20scaling%20concepts&width=400&height=250&seq=blog-3&orientation=landscape',
      category: 'Business Growth',
      readTime: '6 min read',
      date: 'Jan 10, 2025',
      author: 'Emily Rodriguez'
    },
    {
      title: 'Building Trust in the Digital Workplace',
      excerpt: 'Understanding how secure platforms and transparent processes create successful remote work relationships.',
      image: 'https://readdy.ai/api/search-image?query=Digital%20security%20and%20trust%20visualization%20with%20shield%20icons%20secure%20connections%20and%20professional%20handshake%20concepts%2C%20modern%20cybersecurity%20design&width=400&height=250&seq=blog-4&orientation=landscape',
      category: 'Platform Security',
      readTime: '7 min read',
      date: 'Jan 8, 2025',
      author: 'Michael Thompson'
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-gray-50">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-24"></div>
            <span className="px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Resources
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-24"></div>
          </div>
          
          <h2 
            className={`text-4xl lg:text-6xl font-bold text-gray-900 mb-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Insights & Tips
          </h2>
          
          <p 
            className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Stay informed with the latest trends, tips, and insights from the world of micro-tasks
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className={`group cursor-pointer transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Author & Read More */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      By {post.author}
                    </div>
                    
                    <div className="flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                      <span className="text-sm font-medium">Read more</span>
                      <i className="ri-arrow-right-line ml-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div 
          className={`text-center mt-16 transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <a 
            href="/blog" 
            className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            View All Articles
            <i className="ri-arrow-right-line ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
