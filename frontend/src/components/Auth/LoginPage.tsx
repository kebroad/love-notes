import { useState } from 'react';
import type { User } from '../../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState<'joe' | 'jane'>('joe');
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
      // Development mode - accept any password
      const mockUser: User = {
        id: username === 'joe' ? 'user_joe' : 'user_jane',
        username,
        displayName: username === 'joe' ? '💙 Joe' : '💖 Jane',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onLogin(mockUser);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Nicole and Kevin's Notes</h1>
          <p>Send love notes to each other's Raspberry Pi</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Who are you?</label>
            <select
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value as 'joe' | 'jane')}
              className="form-select"
            >
              <option value="joe">💙 Joe</option>
              <option value="jane">💖 Jane</option>
            </select>
          </div>

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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="dev-notice">
            🔓 Development mode: Any password works!
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 