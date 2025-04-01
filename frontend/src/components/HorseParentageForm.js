import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import api from '../utils/api';

const HorseParentageForm = ({ open, onClose, horseId, currentParentage, onUpdate }) => {
  const [horses, setHorses] = useState([]);
  const [sireId, setSireId] = useState(currentParentage?.sire?._id || '');
  const [damId, setDamId] = useState(currentParentage?.dam?._id || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const { data } = await api.get('/api/horses');
        // Filter out the current horse and its descendants to prevent circular relationships
        const filteredHorses = data.filter(horse => horse._id !== horseId);
        setHorses(filteredHorses);
      } catch (err) {
        console.error('Error fetching horses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHorses();
  }, [horseId]);

  const handleError = useCallback((error) => {
    if (error.response?.status === 401) {
      setError('Please login to update horse information');
    } else {
      setError(error.response?.data?.message || 'Failed to update horse information');
    }
  }, []);

  const handleSubmit = async () => {
    setError('');
    try {
      await api.put(`/api/horses/${horseId}`, {
        sireId: sireId || null,
        damId: damId || null,
      });
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating parentage:', err);
      handleError(err);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Parentage</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Эцэг</InputLabel>
            <Select
              value={sireId}
              label="Эцэг"
              onChange={(e) => setSireId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {horses
                .filter(horse => !damId || horse._id !== damId) // Can't be both sire and dam
                .map(horse => (
                  <MenuItem key={horse._id} value={horse._id}>
                    {horse.name} ({horse.registrationNumber})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Эх</InputLabel>
            <Select
              value={damId}
              label="Эх"
              onChange={(e) => setDamId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {horses
                .filter(horse => !sireId || horse._id !== sireId) // Can't be both sire and dam
                .map(horse => (
                  <MenuItem key={horse._id} value={horse._id}>
                    {horse.name} ({horse.registrationNumber})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
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

export default HorseParentageForm;
