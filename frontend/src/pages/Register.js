import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      const userData = await registerUser(username, email, password);
      login(userData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign up</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              required
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              required
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              required
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              required
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate('/login')}
          >
            Already have an account? Sign In
          </button>
        </form>
      </div>

      <style jsx="true">{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 64px);
          padding: 2rem;
          background-color: var(--color-background);
        }

        .auth-card {
          background-color: var(--color-white);
          border-radius: 8px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: var(--shadow-medium);
        }

        .auth-card h1 {
          text-align: center;
          color: var(--color-secondary);
          margin-bottom: 2rem;
          font-family: 'Playfair Display', serif;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: var(--color-secondary);
          font-weight: 500;
        }

        .form-group input {
          padding: 0.8rem;
          border: 1px solid var(--color-primary);
          border-radius: 4px;
          font-family: 'Lato', sans-serif;
          transition: var(--transition-default);
        }

        .form-group input:focus {
          border-color: var(--color-accent);
          outline: none;
          box-shadow: var(--shadow-soft);
        }

        .error-message {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .button {
          padding: 1rem;
        }

        .button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-secondary {
          background-color: transparent;
          border: 1px solid var(--color-secondary);
          color: var(--color-secondary);
          padding: 1rem;
        }

        .button-secondary:hover {
          background-color: var(--color-secondary);
          color: var(--color-white);
        }
      `}</style>
    </div>
  );
};

export default Register;
