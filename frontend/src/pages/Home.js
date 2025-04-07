import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HorseCard from '../components/HorseCard';
import HorseForm from '../components/HorseForm';
import api from '../utils/api';
import { testS3Connection } from '../utils/testS3';

const Home = () => {
  const { auth, isAuthenticated } = useAuth();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewHorseFormOpen, setIsNewHorseFormOpen] = useState(false);
  const [s3TestResult, setS3TestResult] = useState(null);

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const { data } = await api.get('/api/horses');
        setHorses(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching horses');
        setLoading(false);
      }
    };

    fetchHorses();
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          color: 'var(--color-secondary)'
        }}>
          Монгол Үржүүлэгчид
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAuthenticated && (
            <button
              className="button"
              onClick={() => setIsNewHorseFormOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
              Шинээр морь бүртгүүлэх
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={async () => {
                try {
                  const result = await testS3Connection();
                  setS3TestResult({ success: true, message: result.message });
                } catch (error) {
                  setS3TestResult({ 
                    success: false, 
                    message: error.response?.data?.message || error.message 
                  });
                }
              }}
              style={{
                border: '1px solid var(--color-secondary)',
                backgroundColor: 'transparent',
                color: 'var(--color-secondary)'
              }}
            >
              Test S3 Connection
            </button>
          )}
        </div>
      </div>

      {s3TestResult && (
        <div style={{ 
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: s3TestResult.success ? 'rgba(0, 128, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          color: s3TestResult.success ? 'darkgreen' : 'darkred',
          borderRadius: '4px'
        }}>
          {s3TestResult.message}
        </div>
      )}

      <h2 style={{ 
        fontSize: '1.8rem',
        color: 'var(--color-secondary)',
        marginBottom: '2rem'
      }}>
        Бүртгэлтэй Адуу
      </h2>
      
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          padding: '3rem'
        }}>
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div style={{ 
          color: '#dc3545',
          padding: '1rem',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      ) : (
        <div className="horse-grid">
          {horses.length > 0 ? 
            horses.map((horse) => (
              <HorseCard key={horse._id} horse={horse} />
            )) :
            [...Array(9)].map((_, index) => (
              <HorseCard 
                key={index}
                horse={`/assets/images/horse/${['1ccda0ae9b5cc8952a4d7eef6c4089b3.jpg', '9f9f21b635fdb1cb25231a1b952610a8.jpg', '90f504ac319b78d86301fc60f28d98c0.jpg', '107ed104221d230a6f4d5f096a2e5265.jpg', '5989bd2ee1db05e1623a476fd0e61037.jpg', '55089f4fb9a0b13004602de281eef514.jpg', 'a26f69da46f34c8bc552799463deb009.jpg', 'b76a8804306c224111b87f5e4dc785c1.jpg', 'd8b73d9777e1ae2344ec85cd49f41be4.jpg'][index % 9]}`} 
                previewOnly={true}
              />
            ))
          }
        </div>
      )}

      {/* Dashboard Section - Only shown when authenticated */}
      {auth && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          <div style={{ 
            gridColumn: 'span 8',
            backgroundColor: 'var(--color-white)',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: 'var(--shadow-medium)'
          }}>
            <h3 style={{ 
              color: 'var(--color-secondary)',
              marginBottom: '1.5rem'
            }}>
              Your Breeding Dashboard
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <p style={{ color: 'var(--color-text)' }}>
                Welcome back, {auth.username}! Your breeding journey continues here.
              </p>
              <button
                className="button"
                onClick={() => setIsNewHorseFormOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
                Add New Horse
              </button>
            </div>
          </div>
          
          <div style={{ 
            gridColumn: 'span 4',
            backgroundColor: 'var(--color-white)',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: 'var(--shadow-medium)'
          }}>
            <h3 style={{ 
              color: 'var(--color-secondary)',
              marginBottom: '1.5rem'
            }}>
              Quick Stats
            </h3>
            <p style={{ color: 'var(--color-text)' }}>
              View your breeding statistics and progress here.
            </p>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-background);
          border-radius: 50%;
          border-top-color: var(--color-secondary);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <HorseForm
        open={isNewHorseFormOpen}
        onClose={() => setIsNewHorseFormOpen(false)}
        onUpdate={async () => {
          const { data } = await api.get('/api/horses');
          setHorses(data);
        }}
      />
    </div>
  );
};

export default Home;
