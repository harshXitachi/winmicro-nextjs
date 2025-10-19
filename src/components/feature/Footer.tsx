'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Footer content animation
      if (footerRef.current) {
        const sections = footerRef.current.querySelectorAll('.footer-section');
        gsap.fromTo(sections,
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 90%",
              end: "bottom 10%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // Brand name animation
      if (brandRef.current) {
        const letters = brandRef.current.querySelectorAll('span');
        gsap.fromTo(letters,
          { y: 100, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            stagger: 0.05,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: brandRef.current,
              start: "top 90%",
              end: "bottom 10%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Hover effect for letters
        letters.forEach((letter) => {
          letter.addEventListener('mouseenter', () => {
            gsap.to(letter, { y: -10, scale: 1.1, duration: 0.3, ease: "power2.out" });
          });
          
          letter.addEventListener('mouseleave', () => {
            gsap.to(letter, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
          });
        });
      }

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="bg-white border-t border-gray-100">
      <div className="px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
            {/* Pages */}
            <div className="footer-section">
              <h4 className="font-medium text-gray-900 mb-4">Pages</h4>
              <div className="space-y-3">
                <a href="/" className="block text-gray-600 hover:text-gray-900 transition-colors">Home</a>
                <a href="/tasks" className="block text-gray-600 hover:text-gray-900 transition-colors">Browse Tasks</a>
                <a href="/how-it-works" className="block text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
                <a href="/blog" className="block text-gray-600 hover:text-gray-900 transition-colors">Blog</a>
                <a href="/auth" className="block text-gray-600 hover:text-gray-900 transition-colors">Login</a>
              </div>
            </div>

            {/* Company */}
            <div className="footer-section">
              <h4 className="font-medium text-gray-900 mb-4">Company</h4>
              <div className="space-y-3">
                <a href="/about" className="block text-gray-600 hover:text-gray-900 transition-colors">About</a>
                <a href="/careers" className="block text-gray-600 hover:text-gray-900 transition-colors">Careers</a>
                <a href="/press" className="block text-gray-600 hover:text-gray-900 transition-colors">Press</a>
                <a href="/contact" className="block text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              </div>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h4 className="font-medium text-gray-900 mb-4">Support</h4>
              <div className="space-y-3">
                <a href="/help" className="block text-gray-600 hover:text-gray-900 transition-colors">Help Center</a>
                <a href="/faq" className="block text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
                <a href="/safety" className="block text-gray-600 hover:text-gray-900 transition-colors">Safety</a>
                <a href="/terms" className="block text-gray-600 hover:text-gray-900 transition-colors">Terms</a>
              </div>
            </div>

            {/* Social */}
            <div className="footer-section">
              <h4 className="font-medium text-gray-900 mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors group">
                  <i className="ri-instagram-line text-gray-600 group-hover:text-gray-900 transition-colors"></i>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors group">
                  <i className="ri-twitter-x-line text-gray-600 group-hover:text-gray-900 transition-colors"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors group">
                  <i className="ri-youtube-line text-gray-600 group-hover:text-gray-900 transition-colors"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 lg:mb-0">
              <span>© 2025 Micro~Win</span>
              <div className="w-px h-4 bg-gray-300"></div>
              <span>Powered by <a href="https://readdy.ai/?origin=logo" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Readdy</a></span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="/cookies" className="hover:text-gray-900 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>

      {/* Large Brand Name */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div ref={brandRef} className="text-8xl lg:text-9xl font-bold text-gray-900 text-center cursor-default">
            <div className="flex justify-center">
              <span className="hover:text-blue-600 transition-colors duration-300">M</span>
              <span className="hover:text-blue-600 transition-colors duration-300">i</span>
              <span className="hover:text-blue-600 transition-colors duration-300">c</span>
              <span className="hover:text-blue-600 transition-colors duration-300">r</span>
              <span className="hover:text-blue-600 transition-colors duration-300">o</span>
              <span className="text-blue-600 hover:text-gray-900 transition-colors duration-300">~</span>
              <span className="hover:text-blue-600 transition-colors duration-300">W</span>
              <span className="hover:text-blue-600 transition-colors duration-300">i</span>
              <span className="hover:text-blue-600 transition-colors duration-300">n</span>
              <span className="text-gray-400 hover:text-blue-600 transition-colors duration-300">™</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}