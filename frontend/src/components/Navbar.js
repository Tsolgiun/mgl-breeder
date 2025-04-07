import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div 
          className="navbar-brand"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          Mongolian Breeders
        </div>
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <span 
                style={{ 
                  cursor: 'pointer',
                  color: 'var(--color-secondary)',
                  fontWeight: 500
                }}
                onClick={() => navigate('/profile')}
              >
                Тавтай морил, {user.username}
              </span>
              <button 
                onClick={handleLogout}
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--color-secondary)',
                  boxShadow: 'none'
                }}
              >
                Гарах
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--color-secondary)',
                  boxShadow: 'none'
                }}
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="button"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
