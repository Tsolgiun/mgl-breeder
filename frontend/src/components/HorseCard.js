import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HorseCard = ({ horse, previewOnly = false }) => {
  const { user } = useAuth();
  const isOwner = user && horse.owner && user._id === horse.owner._id;

  return (
    <Link 
      to={previewOnly ? '#' : `/horse/${horse._id}`} 
      className="horse-card card" 
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          position: 'relative',
          paddingTop: '85%',
          width: '100%',
          backgroundColor: 'var(--color-background)',
          overflow: 'hidden'
        }}
      >
        <img
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: 'inherit',
            transition: 'transform 0.3s ease'
          }}
          src={previewOnly ? horse : horse.imageUrl}
          alt={previewOnly ? "Horse" : horse.name}
        />
      </div>
      <div className="horse-card-content">
        <h3>
          {previewOnly ? "Mongolian Horse" : horse.name}
        </h3>
        {previewOnly ? (
          <p style={{ color: 'var(--color-text)' }}>
            A beautiful specimen of the hardy and historic Mongolian horse breed.
          </p>
        ) : (
          <>
            <p style={{ 
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
              fontSize: '0.95rem'
            }}>
              Зүс: {horse.color}
            </p>
            <p style={{ 
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
              fontSize: '0.95rem'
            }}>
              Төрсөн: {new Date(horse.birthDate).getFullYear()}
            </p>
            <p style={{ 
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
              fontSize: '0.95rem'
            }}>
              Эзэмшигч: {horse.owner?.username}
            </p>
            {isOwner && (
              <div 
                style={{
                  display: 'inline-block',
                  padding: '0.3rem 0.8rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-secondary)',
                  borderRadius: '16px',
                  fontSize: '0.85rem'
                }}
              >
                Миний морь
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  );
};

export default HorseCard;
