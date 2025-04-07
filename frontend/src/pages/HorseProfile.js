import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HorseParentageForm from '../components/HorseParentageForm';
import HorseForm from '../components/HorseForm';
import PedigreeTree from '../components/PedigreeTree';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const HorseProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [horse, setHorse] = useState(null);
  const [pedigree, setPedigree] = useState(null);
  const [descendants, setDescendants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isParentageFormOpen, setIsParentageFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const isOwner = useMemo(() => {
    return user && horse?.owner?._id === user._id;
  }, [user, horse]);

  const fetchPedigree = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/horses/${id}/pedigree?generations=4`);
      setPedigree(data);
    } catch (err) {
      console.error('Error fetching pedigree:', err);
    }
  }, [id]);

  const fetchDescendants = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/horses/${id}/descendants?generations=4`);
      setDescendants(data);
    } catch (err) {
      console.error('Error fetching descendants:', err);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/api/horses/${id}`);
        setHorse(data);
        await fetchPedigree();
        await fetchDescendants();
      } catch (err) {
        setError('Horse not found');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, fetchPedigree, fetchDescendants]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const tabs = ['Үндсэн мэдээлэл', 'Удам угсаа', 'Үр удам'];

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {horse && (
        <div>
          {/* Tabs Navigation */}
          <div className="tabs">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`tab-button ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Main Profile Content */}
          {activeTab === 0 && (
            <div className="profile-grid">
              {/* Horse Image Section */}
              <div className="profile-image-section card">
                {isOwner && (
                  <button
                    className="edit-button"
                    onClick={() => setIsEditFormOpen(true)}
                  >
                    Засах
                  </button>
                )}
                <div className="image-container">
                  <img
                    src={horse.imageUrl}
                    alt={horse.name}
                    className="horse-image"
                  />
                </div>
              </div>

              {/* Horse Details Section */}
              <div className="profile-details card">
                <h2>{horse.name}</h2>
                <div className="details-divider"></div>
                
                <div className="details-list">
                  <div className="detail-item">
                    <div className="detail-header">
                      <span>Эцэг</span>
                      {isOwner && (
                        <button
                          className="link-button"
                          onClick={() => setIsParentageFormOpen(true)}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="detail-value">
                      {horse.parentage?.sire ? horse.parentage.sire.name : 'Not available'}
                    </div>
                  </div>

                  {[
                    { label: 'Эх', value: horse.parentage?.dam ? horse.parentage.dam.name : 'Not available' },
                    { label: 'Төрсөн огноо', value: new Date(horse.birthDate).toLocaleDateString() },
                    { label: 'Төрсөн нутаг', value: horse.birthPlace },
                    { label: 'Бүртгэлийн дугаар', value: horse.registrationNumber },
                    { label: 'Микрочип', value: horse.microchip || 'Not available' },
                    { label: 'Тамга', value: horse.brand || 'Not available' },
                    { label: 'Зүс', value: horse.color },
                    { label: 'Эзэмшигч', value: horse.owner?.username },
                    { label: 'Үржүүлэгч', value: horse.breeder },
                    { label: 'Бүртгэгдсэн', value: new Date(horse.registrationDate).toLocaleDateString() }
                  ].map(({ label, value }) => (
                    <div key={label} className="detail-item">
                      <span className="detail-label">{label}</span>
                      <span className="detail-value">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Delete Button */}
                {isOwner && (
                  <div className="delete-section">
                    <button
                      className="delete-button"
                      onClick={() => {
                        const confirmDelete = window.confirm('Are you sure you want to delete this horse?');
                        if (confirmDelete) {
                          api.delete(`/api/horses/${id}`)
                            .then(() => navigate('/'))
                            .catch(err => console.error('Error deleting horse:', err));
                        }
                      }}
                    >
                    Устгах
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pedigree View */}
          {activeTab === 1 && (
            <div className="pedigree-container">
              <div className="card pedigree-card">
                <h3 className="pedigree-title">Удам угсаа</h3>
                <div className="pedigree-content">
                  <PedigreeTree pedigree={pedigree} type="ancestors" />
                </div>
              </div>
            </div>
          )}

          {/* Descendants View */}
          {activeTab === 2 && (
            <div className="pedigree-container">
              <div className="card pedigree-card">
                <h3 className="pedigree-title">Үр удам</h3>
                <div className="pedigree-content">
                  <PedigreeTree pedigree={descendants} type="descendants" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <HorseParentageForm
        open={isParentageFormOpen}
        onClose={() => setIsParentageFormOpen(false)}
        horseId={id}
        currentParentage={horse?.parentage}
        onUpdate={async () => {
          const { data } = await api.get(`/api/horses/${id}`);
          setHorse(data);
          await fetchPedigree();
          await fetchDescendants();
        }}
      />

      <HorseForm
        open={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        horse={horse}
        onUpdate={async () => {
          const { data } = await api.get(`/api/horses/${id}`);
          setHorse(data);
        }}
      />

      <style jsx="true">{`
        .profile-grid {
          display: grid;
          grid-template-columns: minmax(300px, 400px) 600px;
          gap: 2rem;
          margin: 2rem auto;
          align-items: start;
          justify-content: center;
          max-width: 1000px;
        }

        .tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .tab-button {
          padding: 0.8rem 1.5rem;
          background: var(--color-white);
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--color-text);
          cursor: pointer;
          transition: var(--transition-default);
        }

        .tab-button.active {
          border-bottom-color: var(--color-accent);
          color: var(--color-secondary);
        }

        .profile-image-section {
          position: relative;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 400px;
          background-color: var(--color-background);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-primary);
          border-radius: 4px;
          overflow: hidden;
        }

        .horse-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }

        .edit-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 1;
          background-color: var(--color-white);
          border: 1px solid var(--color-secondary);
          color: var(--color-secondary);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--transition-default);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 80px;
        }

        .edit-button:hover {
          background-color: var(--color-secondary);
          color: var(--color-white);
        }

        .details-divider {
          height: 1px;
          background-color: var(--color-primary);
          margin: 1.5rem 0;
        }

        .details-list {
          display: grid;
          gap: 1.2rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.8rem;
          border-bottom: 1px solid var(--color-background);
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .detail-label {
          color: var(--color-secondary);
          font-weight: 500;
          min-width: 160px;
        }

        .detail-value {
          color: var(--color-text);
          text-align: right;
          flex: 1;
        }

        .link-button {
          background: none;
          border: none;
          color: var(--color-accent);
          cursor: pointer;
          padding: 0;
          font-size: 0.9rem;
        }

        .link-button:hover {
          text-decoration: underline;
        }

        .delete-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-primary);
          display: flex;
          justify-content: flex-end;
        }

        .delete-button {
          background-color: #fee2e2;
          color: #dc2626;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--transition-default);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 80px;
        }

        .delete-button:hover {
          background-color: #fecaca;
        }

        @media (max-width: 1024px) {
          .profile-grid {
            grid-template-columns: minmax(300px, 400px) minmax(400px, 600px);
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            max-width: 600px;
          }

          .image-container {
            height: 350px;
          }
        }

        .pedigree-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .pedigree-card {
          background: var(--color-white);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
          overflow: hidden;
        }

        .pedigree-title {
          padding: 1rem;
          margin: 0;
          border-bottom: 1px solid var(--color-background);
          font-size: 1.25rem;
          color: var(--color-secondary);
        }

        .pedigree-content {
          padding: 1rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 480px) {
          .image-container {
            height: 300px;
          }

          .tabs {
            flex-direction: column;
            gap: 0.5rem;
          }

          .tab-button {
            width: 100%;
          }

          .pedigree-container {
            padding: 0 0.5rem;
          }

          .pedigree-content {
            padding: 0.5rem;
          }
        }

        @media (min-width: 1200px) {
          .pedigree-container {
            padding: 0 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HorseProfile;
