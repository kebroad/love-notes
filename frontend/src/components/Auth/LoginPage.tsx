import { useState } from 'react';
import { GrLogin } from "react-icons/gr";
import type { User } from '../../types';
import { authAPI } from '../../services/api';
import AppTitle from '../shared/AppTitle';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState<'kevin' | 'nicole'>('kevin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!password.trim()) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }

    try {
      // Use the real authentication API
      const result = await authAPI.login({ username, password });
      
      if (result.success && result.data) {
        // Store password for API calls (in a real app, you'd use tokens)
        localStorage.setItem('loveNotesPassword', password);
        onLogin(result.data.user);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page app-background">
      <div className="login-header">
        <AppTitle />
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="user-selection">
          <div 
            className={`user-card ${username === 'kevin' ? 'selected' : ''}`}
            onClick={() => setUsername('kevin')}
          >
            <img 
              src="/Kevin.jpg" 
              alt="Kevin" 
              className="profile-picture"
            />
            <span className="user-name">Kevin</span>
          </div>
          <div 
            className={`user-card ${username === 'nicole' ? 'selected' : ''}`}
            onClick={() => setUsername('nicole')}
          >
            <img 
              src="/Nicole.jpg" 
              alt="Nicole" 
              className="profile-picture"
            />
            <span className="user-name">Nicole</span>
          </div>
        </div>

        <div className="password-form-card">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="hint-text">
            Hint: Use "password123" for both Kevin and Nicole
          </div>
        </div>

        <button type="submit" className="login-button btn-primary" disabled={loading}>
          <GrLogin />
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage; 