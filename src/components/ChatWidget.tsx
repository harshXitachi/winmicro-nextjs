'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatWidget() {
  const pathname = usePathname();
  
  // Only show on homepage (root path)
  const shouldShowWidget = pathname === '/';

  useEffect(() => {
    if (!shouldShowWidget) return;

    // Load the Readdy Agent Widget script
    const script = document.createElement('script');
    script.src = 'https://readdy.ai/api/public/assistant/widget?projectId=d6e3c9de-8ecd-4775-98c0-f26e56d1f683';
    script.async = true;
    script.setAttribute('data-mode', 'hybrid');
    script.setAttribute('data-voice-show-transcript', 'true');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-size', 'compact');
    script.setAttribute('data-position', 'bottom-left');
    script.setAttribute('data-accent-color', '#14B8A6');
    script.setAttribute('data-button-base-color', '#000000');
    script.setAttribute('data-button-accent-color', '#FFFFFF');

    document.body.appendChild(script);

    // Cleanup function to remove the widget when navigating away
    return () => {
      // Remove the script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      // Remove any widget elements that might have been created
      const widgetElements = document.querySelectorAll('[id*="readdy"], [class*="readdy"]');
      widgetElements.forEach(el => el.remove());
    };
  }, [shouldShowWidget]);

  return null; // This component doesn't render anything visible
}
