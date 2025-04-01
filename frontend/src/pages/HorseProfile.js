import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HorseParentageForm from '../components/HorseParentageForm';
import HorseForm from '../components/HorseForm';
import PedigreeTree from '../components/PedigreeTree';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const HorseProfile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [horse, setHorse] = useState(null);
  const [pedigree, setPedigree] = useState(null);
  const [descendants, setDescendants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isParentageFormOpen, setIsParentageFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {horse && (
        <Grid container spacing={3}>
          {/* Tabs for switching views */}
          <Grid item xs={12}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Үндсэн мэдээлэл" />
              <Tab label="Удам угсаа" />
              <Tab label="Үр удам" />
            </Tabs>
          </Grid>
          {tabValue === 0 && (
            <>
              {/* Horse Image */}
              <Grid item xs={12} md={6}>
              <Card sx={{ position: 'relative' }}>
                {isAuthenticated && (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditFormOpen(true)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                  >
                    Edit
                  </Button>
                )}
                <Box
                  sx={{
                    position: 'relative',
                    // Maintain aspect ratio but allow taller height for detail view
                    paddingTop: { xs: '100%', md: '75%' }, // 4:3 ratio on larger screens
                    width: '100%',
                    backgroundColor: 'grey.100' // Placeholder while loading
                  }}
                >
                  <CardMedia
                    component="img"
                    image={horse.imageUrl}
                    alt={horse.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain', // Show full image without cropping
                      backgroundColor: 'inherit'
                    }}
                  />
                </Box>

      <HorseForm
        open={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        horse={horse}
        onUpdate={async () => {
          const { data } = await api.get(`/api/horses/${id}`);
          setHorse(data);
        }}
      />
                </Card>
              </Grid>

              {/* Horse Details */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h4" gutterBottom>
                    {horse.name}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    <ListItem
                      secondaryAction={
                        isAuthenticated ? (
                          <Button
                            startIcon={<EditIcon />}
                            onClick={() => setIsParentageFormOpen(true)}
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            startIcon={<EditIcon />}
                            onClick={() => navigate('/login')}
                          >
                            Login to Edit
                          </Button>
                        )
                      }
                    >
                      <ListItemText
                        primary="Эцэг"
                        secondary={horse.parentage?.sire ? horse.parentage.sire.name : 'Not available'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Эх"
                        secondary={horse.parentage?.dam ? horse.parentage.dam.name : 'Not available'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Төрсөн огноо"
                        secondary={new Date(horse.birthDate).toLocaleDateString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Төрсөн нутаг"
                        secondary={horse.birthPlace}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Бүртгэлийн дугаар"
                        secondary={horse.registrationNumber}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Микрочип"
                        secondary={horse.microchip || 'Not available'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Тамга"
                        secondary={horse.brand || 'Not available'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Зүс"
                        secondary={horse.color}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Эзэмшигч"
                        secondary={horse.owner}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Үржүүлэгч"
                        secondary={horse.breeder}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Бүртгэгдсэн"
                        secondary={new Date(horse.registrationDate).toLocaleDateString()}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </>
          )}

          {/* Pedigree View */}
          {tabValue === 1 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Удам угсаа
                </Typography>
                <PedigreeTree pedigree={pedigree} type="ancestors" />
              </Paper>
            </Grid>
          )}

          {/* Descendants View */}
          {tabValue === 2 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Үр удам
                </Typography>
                <PedigreeTree pedigree={descendants} type="descendants" />
              </Paper>
            </Grid>
          )}
        </Grid>
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
    </Container>
  );
};

export default HorseProfile;
