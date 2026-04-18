import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {

    const { pathname } = useLocation();

    useEffect(() => {
        // 🚀 URL (pathname) her değiştiğinde sayfayı en üste çek
      window.scrollTo(0, 0);
    }, [pathname]);

  return null; // Görsel bir şey döndürmesine gerek yok
}

export default ScrollToTop;