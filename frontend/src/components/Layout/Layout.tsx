import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TiThMenu } from "react-icons/ti";
import { GrLogout } from "react-icons/gr";
import { FaPencilAlt, FaPaintBrush } from "react-icons/fa";
import { MdHistory } from "react-icons/md";
import type { ReactNode } from 'react';
import type { User } from '../../types';
import AppTitle from '../shared/AppTitle';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

const Layout = ({ user, onLogout, children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="layout app-background">
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
              
              <AppTitle />
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
          
          <AppTitle className="drawer-title" />
        </div>
        
        <div className="user-info">
          <img 
            src={`/${user.username === 'kevin' ? 'Kevin' : 'Nicole'}.jpg`} 
            alt={user.username} 
            className="user-profile-picture"
          />
          <span className="user-display-name">{user.displayName}</span>
        </div>
        
        <div className="drawer-content">
          <button 
            className={`drawer-item ${location.pathname === '/draw' ? 'active' : ''}`}
            onClick={() => navigateTo('/draw')}
          >
            <span className="drawer-icon">
              <FaPencilAlt />
            </span>
            <span className="drawer-text">Draw</span>
          </button>
          <button 
            className={`drawer-item ${location.pathname === '/paint' ? 'active' : ''}`}
            onClick={() => navigateTo('/paint')}
          >
            <span className="drawer-icon">
              <FaPaintBrush />
            </span>
            <span className="drawer-text">Paint</span>
          </button>
          <button 
            className={`drawer-item ${location.pathname === '/history' ? 'active' : ''}`}
            onClick={() => navigateTo('/history')}
          >
            <span className="drawer-icon">
              <MdHistory />
            </span>
            <span className="drawer-text">History</span>
          </button>
          <button 
            className="drawer-item logout-item"
            onClick={onLogout}
          >
            <span className="drawer-icon">
              <GrLogout />
            </span>
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