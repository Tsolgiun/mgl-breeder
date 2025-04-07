import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const FileUpload = ({ onFileSelect, value, progress, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }
    
    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    try {
      validateFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Pass file to parent
      onFileSelect(file);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        className={`file-upload ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        {preview || value ? (
          <div className="preview-container">
            <img
              src={preview || value}
              alt="Preview"
              className="preview-image"
            />
            {progress !== undefined && progress < 100 && (
              <div className="upload-progress">
                <div className="progress-text">
                  Uploading... {progress}%
                </div>
                <div 
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            <p>Drop an image here or click to select</p>
            <p className="upload-subtitle">Maximum size: 5MB</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/*"
        style={{ display: 'none' }}
      />
      {error && <p className="error-text">{error}</p>}

      <style jsx="true">{`
        .file-upload {
          border: 2px dashed var(--color-primary);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: var(--transition-default);
          background-color: var(--color-white);
        }

        .file-upload:hover {
          border-color: var(--color-accent);
          background-color: rgba(191, 167, 128, 0.05);
        }

        .file-upload.dragging {
          border-color: var(--color-accent);
          background-color: rgba(191, 167, 128, 0.1);
        }

        .file-upload.error {
          border-color: #dc2626;
        }

        .preview-container {
          position: relative;
          max-width: 100%;
        }

        .preview-image {
          max-height: 200px;
          margin: 0 auto;
          border-radius: 8px;
          box-shadow: var(--shadow-soft);
        }

        .upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: var(--color-white);
          padding: 0.5rem;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }

        .progress-text {
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .progress-bar {
          height: 2px;
          background-color: var(--color-accent);
          transition: width 0.3s ease;
        }

        .upload-placeholder {
          color: var(--color-text);
        }

        .upload-subtitle {
          font-size: 0.875rem;
          margin-top: 0.5rem;
          color: var(--color-secondary);
        }

        .error-text {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

FileUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  value: PropTypes.string,
  progress: PropTypes.number,
  error: PropTypes.string,
};

export default FileUpload;
