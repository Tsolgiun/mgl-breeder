import { Box, Card, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const PedigreeCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1),
  margin: theme.spacing(1),
  minWidth: 120,
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PedigreeTree = ({ pedigree, type = 'ancestors' }) => {
  if (!pedigree) return null;

  const renderAncestors = (horse, level = 0) => {
    if (!horse) return null;

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ maxWidth: level === 0 ? '60%' : '100%', mx: 'auto' }}>
          <PedigreeCard>
            <Typography variant="subtitle2" fontWeight="bold">
              {horse.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {horse.color} • {horse.registrationNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(horse.birthDate).getFullYear()}
            </Typography>
          </PedigreeCard>
        </Box>
        {level < 4 && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              {horse.sire && renderAncestors(horse.sire, level + 1)}
            </Grid>
            <Grid item xs={6}>
              {horse.dam && renderAncestors(horse.dam, level + 1)}
            </Grid>
          </Grid>
        )}
      </Box>
    );
  };

  const renderDescendants = (horse, level = 0) => {
    if (!horse) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <PedigreeCard>
          <Typography variant="subtitle1" fontWeight="bold">
            {horse.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {horse.color} • {horse.registrationNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(horse.birthDate).getFullYear()}
          </Typography>
        </PedigreeCard>
        {level < 4 && horse.offspring && horse.offspring.length > 0 && (
          <Grid container spacing={2} sx={{ ml: 4 }}>
            {horse.offspring.map((child, index) => (
              <Grid item xs={12} key={child._id || index}>
                {renderDescendants(child, level + 1)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {type === 'ancestors' ? renderAncestors(pedigree) : renderDescendants(pedigree)}
    </Box>
  );
};

export default PedigreeTree;
