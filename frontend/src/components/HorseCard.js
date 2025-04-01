import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const HorseCard = ({ horse, previewOnly = false }) => {
  return (
    <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          position: 'relative',
          paddingTop: '100%', // 1:1 Aspect ratio container
          width: '100%',
          backgroundColor: 'grey.100' // Placeholder while loading
        }}
      >
        <CardMedia
          component="img"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Show full image without cropping
            backgroundColor: 'inherit'
          }}
          image={previewOnly ? horse : horse.imageUrl}
          alt={previewOnly ? "Horse" : horse.name}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {previewOnly ? "Mongolian Horse" : horse.name}
        </Typography>
        {previewOnly ? (
          <Typography>
            A beautiful specimen of the hardy and historic Mongolian horse breed.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Зүс: {horse.color}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Төрсөн: {new Date(horse.birthDate).getFullYear()}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                component={Link}
                to={`/horse/${horse._id}`}
                variant="outlined"
                fullWidth
              >
                Дэлгэрэнгүй
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HorseCard;
