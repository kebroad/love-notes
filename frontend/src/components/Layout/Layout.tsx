import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TiThMenu } from "react-icons/ti";
import type { ReactNode } from 'react';
import type { User } from '../../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

// Custom hook to detect mobile screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
};

const Layout = ({ user, onLogout, children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          {!isMenuOpen && (
            <>
              <button 
                className="hamburger-menu"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <TiThMenu size={"2.5rem"} />
              </button>
              
              <h1 className="app-title">
                {isMobile ? "K+N❤️" : "Nicole and Kevin's Notes ❤️"}
              </h1>
            </>
          )}
        </div>
      </header>

      {/* Dark overlay */}
      {isMenuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Left side drawer */}
      <div className={`menu-drawer ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
        <div className="drawer-header">
          <button 
            className="hamburger-menu drawer-hamburger"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <TiThMenu size={"2.5rem"} />
          </button>
          
          <h1 className="app-title drawer-title">
            {isMobile ? "K+N❤️" : "Nicole and Kevin's Notes ❤️"}
          </h1>
        </div>
        
        <div className="drawer-content">
          <button 
            className={`drawer-item ${location.pathname === '/canvas' ? 'active' : ''}`}
            onClick={() => navigateTo('/canvas')}
          >
            <span className="drawer-icon">🎨</span>
            <span className="drawer-text">Canvas</span>
          </button>
          <button 
            className={`drawer-item ${location.pathname === '/history' ? 'active' : ''}`}
            onClick={() => navigateTo('/history')}
          >
            <span className="drawer-icon">📖</span>
            <span className="drawer-text">History</span>
          </button>
          <button 
            className="drawer-item logout-item"
            onClick={onLogout}
          >
            <span className="drawer-icon">🚪</span>
            <span className="drawer-text">Logout</span>
          </button>
        </div>
      </div>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout; 