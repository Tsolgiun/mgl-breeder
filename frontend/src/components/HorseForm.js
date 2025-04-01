import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
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
        // Update existing horse
        await updateHorseWithImage(
          horse._id,
          formData,
          selectedFile,
          (progress) => setUploadProgress(progress)
        );
      } else {
        // Create new horse
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

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{horse ? 'Edit Horse' : 'Add New Horse'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <FileUpload
                onFileSelect={setSelectedFile}
                value={horse?.imageUrl}
                progress={uploadProgress}
                error={error && !selectedFile && horse === null ? 'Image is required' : ''}
              />

              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <TextField
                  required
                  fullWidth
                  label="Birth Date"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  required
                  fullWidth
                  label="Birth Place"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                />
                <TextField
                  required
                  fullWidth
                  label="Registration Number"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                />
              </Box>

              <TextField
                fullWidth
                label="Microchip"
                name="microchip"
                value={formData.microchip}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Owner"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Breeder"
                name="breeder"
                value={formData.breeder}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Registration Date"
                name="registrationDate"
                type="date"
                value={formData.registrationDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HorseForm;
