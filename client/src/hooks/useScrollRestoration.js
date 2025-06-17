import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle scroll restoration when navigating between routes
 * This ensures that the page scrolls to the top when navigating to a new route
 * and that scrolling is properly enabled
 */
const useScrollRestoration = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0);
    
    // Ensure body overflow is set to auto (scrollable)
    document.body.style.overflow = 'auto';
    
    // Remove any lingering fixed positioning that might affect scrolling
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    document.body.style.height = '';
  }, [pathname]);
};

export default useScrollRestoration;
