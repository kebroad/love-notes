import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';

// Excalidraw CSS - import at top level
import '@excalidraw/excalidraw/index.css';

// Components
import LoginPage from './components/Auth/LoginPage';
import Layout from './components/Layout/Layout';
import CanvasPage from './components/Canvas/CanvasPage';
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
        setUser(JSON.parse(storedUser));
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
  };

  if (loading) {
    return (
      <div className="loading-screen">
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
              <Route path="/" element={<Navigate to="/canvas" replace />} />
              <Route path="/canvas" element={<CanvasPage user={user} />} />
              <Route path="/history" element={<HistoryPage user={user} />} />
              <Route path="*" element={<Navigate to="/canvas" replace />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  );
}

export default App;
