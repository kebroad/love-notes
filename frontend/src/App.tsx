import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';

// Excalidraw CSS - import at top level
import '@excalidraw/excalidraw/index.css';

// Components
import LoginPage from './components/Auth/LoginPage';
import Layout from './components/Layout/Layout';
import CanvasPage from './components/Canvas/CanvasPage';
import PaintPage from './components/Paint/PaintPage';
import HistoryPage from './components/Layout/HistoryPage';

import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('loveNotesUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate that the user data is current (only Kevin and Nicole allowed)
        if (parsedUser.username === 'kevin' || parsedUser.username === 'nicole') {
          setUser(parsedUser);
        } else {
          // Clear invalid/old user data
          localStorage.removeItem('loveNotesUser');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('loveNotesUser');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('loveNotesUser', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('loveNotesUser');
    localStorage.removeItem('loveNotesPassword');
  };

  if (loading) {
    return (
      <div className="loading-screen app-background">
        <div className="loading-spinner"></div>
        <p>Loading Love Notes...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Layout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Navigate to="/draw" replace />} />
              <Route path="/draw" element={<CanvasPage user={user} />} />
              <Route path="/paint" element={<PaintPage user={user} />} />
              <Route path="/history" element={<HistoryPage user={user} />} />
              <Route path="*" element={<Navigate to="/draw" replace />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  );
}

export default App;
