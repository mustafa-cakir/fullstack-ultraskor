import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();
    console.log('scrollEd');
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 500);
    }, [pathname]);

    return null;
}
