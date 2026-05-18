import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force immediate scroll to top without any "smooth" animation that might feel like auto-scrolling
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
