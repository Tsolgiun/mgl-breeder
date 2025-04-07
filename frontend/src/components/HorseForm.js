import { useState, useEffect } from 'react';
import { createHorseWithImage, updateHorseWithImage } from '../utils/api';
import FileUpload from './FileUpload';

const HorseForm = ({ open, onClose, horse, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: horse?.name || '',
    birthDate: horse?.birthDate ? new Date(horse.birthDate).toISOString().split('T')[0] : '',
    birthPlace: horse?.birthPlace || '',
    registrationNumber: horse?.registrationNumber || '',
    microchip: horse?.microchip || '',
    brand: horse?.brand || '',
    color: horse?.color || '',
    owner: horse?.owner || '',
    breeder: horse?.breeder || '',
    registrationDate: horse?.registrationDate ? new Date(horse.registrationDate).toISOString().split('T')[0] : ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (horse) {
        await updateHorseWithImage(
          horse._id,
          formData,
          selectedFile,
          (progress) => setUploadProgress(progress)
        );
      } else {
        if (!selectedFile) {
          throw new Error('Please select an image');
        }
        await createHorseWithImage(
          formData,
          selectedFile,
          (progress) => setUploadProgress(progress)
        );
      }

      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error saving horse:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save horse');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{horse ? 'Edit Horse' : 'Add New Horse'}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-grid-col">
                <FileUpload
                  onFileSelect={setSelectedFile}
                  value={horse?.imageUrl}
                  progress={uploadProgress}
                  error={error && !selectedFile && horse === null ? 'Image is required' : ''}
                />
              </div>

              <div className="form-grid-col">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    required
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate">Birth Date *</label>
                  <input
                    required
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthPlace">Birth Place *</label>
                  <input
                    required
                    id="birthPlace"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="registrationNumber">Registration Number *</label>
                  <input
                    required
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="microchip">Microchip</label>
                <input
                  id="microchip"
                  name="microchip"
                  value={formData.microchip}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Color *</label>
                <input
                  required
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner">Owner *</label>
                <input
                  required
                  id="owner"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="breeder">Breeder *</label>
                <input
                  required
                  id="breeder"
                  name="breeder"
                  value={formData.breeder}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="registrationDate">Registration Date *</label>
                <input
                  required
                  type="date"
                  id="registrationDate"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            {error}
            <button 
              onClick={() => setError('')}
              className="close-button"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--color-white);
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-medium);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--color-primary);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .form-grid-col {
          display: grid;
          gap: 1.5rem;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--color-text);
          padding: 0.5rem;
          line-height: 1;
        }

        .close-button:hover {
          color: var(--color-accent);
        }

        .button-secondary {
          background-color: transparent;
          border: 1px solid var(--color-secondary);
          color: var(--color-secondary);
        }

        .button-secondary:hover {
          background-color: var(--color-secondary);
          color: var(--color-white);
        }

        .error-message {
          position: fixed;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          padding: 1rem;
          background-color: #fee2e2;
          color: #dc2626;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 1100;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HorseForm;
