import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome to MGL Breeder
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsNewHorseFormOpen(true)}
          >
            Add New Horse
          </Button>
        )}
        {isAuthenticated && (
          <Button
            variant="outlined"
            color="info"
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
            sx={{ ml: 2 }}
          >
            Test S3 Connection
          </Button>
        )}
      </Box>
      {s3TestResult && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography 
            color={s3TestResult.success ? 'success.main' : 'error.main'}
          >
            {s3TestResult.message}
          </Typography>
        </Box>
      )}

      {/* Horse Cards Grid */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Featured Horses
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
      ) : horses.length > 0 ? (
        <Box 
          sx={{ 
            columns: { xs: '1', sm: '2', md: '3' }, 
            gap: 3,
            mb: 4
          }}
        >
          {horses.map((horse) => (
            <Box key={horse._id} sx={{ mb: 3, breakInside: 'avoid' }}>
              <HorseCard horse={horse} />
            </Box>
          ))}
        </Box>
      ) : (
        // Show preview cards if no horses are in the database yet
        <Box 
          sx={{ 
            columns: { xs: '1', sm: '2', md: '3' }, 
            gap: 3,
            mb: 4
          }}
        >
          {[...Array(9)].map((_, index) => (
            <Box key={index} sx={{ mb: 3, breakInside: 'avoid' }}>
              <HorseCard 
                horse={`/assets/images/horse/${['1ccda0ae9b5cc8952a4d7eef6c4089b3.jpg', '9f9f21b635fdb1cb25231a1b952610a8.jpg', '90f504ac319b78d86301fc60f28d98c0.jpg', '107ed104221d230a6f4d5f096a2e5265.jpg', '5989bd2ee1db05e1623a476fd0e61037.jpg', '55089f4fb9a0b13004602de281eef514.jpg', 'a26f69da46f34c8bc552799463deb009.jpg', 'b76a8804306c224111b87f5e4dc785c1.jpg', 'd8b73d9777e1ae2344ec85cd49f41be4.jpg'][index % 9]}`} 
                previewOnly={true}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Dashboard Section - Only shown when authenticated */}
      {auth && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 240,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Your Breeding Dashboard
              </Typography>
              <Box>
                <Typography variant="body1">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">
                    Welcome back, {auth.username}! Your breeding journey continues here.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setIsNewHorseFormOpen(true)}
                  >
                    Add New Horse
                  </Button>
                </Box>
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 240,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Typography variant="body2">
                View your breeding statistics and progress here.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      <HorseForm
        open={isNewHorseFormOpen}
        onClose={() => setIsNewHorseFormOpen(false)}
        onUpdate={async () => {
          // Refresh the horses list after adding a new one
          const { data } = await api.get('/api/horses');
          setHorses(data);
        }}
      />
    </Container>
  );
};

export default Home;
