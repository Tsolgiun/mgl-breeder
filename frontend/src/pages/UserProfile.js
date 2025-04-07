import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import HorseCard from '../components/HorseCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UserProfile = () => {
  const { user } = useAuth();
  const [userHorses, setUserHorses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserHorses = async () => {
      if (user) {
        try {
          setLoading(true);
          console.log('Fetching horses for user:', user._id);
          const { data } = await api.get(`/api/horses/user/${user._id}`);
          console.log('Fetched horses:', data);
          setUserHorses(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Error fetching user horses:', err);
          setUserHorses([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserHorses();
  }, [user]);

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.username}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Нийт морьд"
                  secondary={userHorses.length}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Бүртгүүлсэн огноо"
                  secondary={new Date(user?.createdAt).toLocaleDateString()}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* User's Horses */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Миний морьд
            </Typography>
            <Grid container spacing={3}>
              {userHorses.map(horse => (
                <Grid item xs={12} sm={6} lg={4} key={horse._id}>
                  <HorseCard
                    horse={horse}
                    onUpdate={() => {
                      // Refresh user's horses after any updates
                      api.get(`/api/horses/user/${user._id}`)
                        .then(({ data }) => setUserHorses(data))
                        .catch(err => console.error('Error refreshing horses:', err));
                    }}
                  />
                </Grid>
              ))}
              {userHorses.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body1" color="textSecondary" align="center">
                    Одоогоор бүртгэлтэй морь байхгүй байна
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;
