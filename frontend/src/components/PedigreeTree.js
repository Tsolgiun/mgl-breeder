import { Box, Card, Typography, Grid, Popover } from '@mui/material';
import { useState } from 'react';
import { styled } from '@mui/material/styles';

const PedigreeCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1),
  margin: theme.spacing(0.5),
  minWidth: 100,
  maxWidth: 200,
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  transition: 'all 0.2s ease-in-out',
}));

const HorsePopover = ({ horse, anchorEl, onClose }) => {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      sx={{
        pointerEvents: 'none',
      }}
    >
      <Box sx={{ p: 1, maxWidth: 200 }}>
        {horse?.imageUrl ? (
          <img
            src={horse.imageUrl}
            alt={horse.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              borderRadius: '4px',
              gap: 1
            }}
          >
            <Typography color="text.secondary">No image</Typography>
          </Box>
        )}
        <Box sx={{ mt: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>Owner:</span>
            <span>{horse?.owner?.username || 'Not available'}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>Breeder:</span>
            <span>{horse?.breeder || 'Not available'}</span>
          </Typography>
        </Box>
      </Box>
    </Popover>
  );
};

const PedigreeTree = ({ pedigree, type = 'ancestors' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredHorse, setHoveredHorse] = useState(null);

  const handleMouseEnter = (event, horse) => {
    setAnchorEl(event.currentTarget);
    setHoveredHorse(horse);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setHoveredHorse(null);
  };

  if (!pedigree) return null;

  const renderAncestors = (horse, level = 0) => {
    if (!horse) return null;

    return (
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}>
        <Box>
          <PedigreeCard
            onMouseEnter={(e) => handleMouseEnter(e, horse)}
            onMouseLeave={handleMouseLeave}
          >
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {horse.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {horse.color} • {horse.registrationNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(horse.birthDate).getFullYear()}
            </Typography>
          </PedigreeCard>
        </Box>
        
        {level < 4 && (
          <>
            <Box
              sx={{
                width: '15px',
                height: '2px',
                backgroundColor: 'grey.300',
                mx: 0.5
              }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '-10px',
                  top: '0',
                  height: '100%',
                  width: '2px',
                  backgroundColor: 'grey.300'
                }
              }}
            >
              {horse.sire && <Box>{renderAncestors(horse.sire, level + 1)}</Box>}
              {horse.dam && <Box>{renderAncestors(horse.dam, level + 1)}</Box>}
            </Box>
          </>
        )}
      </Box>
    );
  };

  const renderDescendants = (horse, level = 0) => {
    if (!horse) return null;

    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        mb: 1
      }}>
        <Box sx={{ width: '100%', maxWidth: level === 0 ? '200px' : '100%', mx: 'auto' }}>
          <PedigreeCard
            onMouseEnter={(e) => handleMouseEnter(e, horse)}
            onMouseLeave={handleMouseLeave}
          >
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
        </Box>
        
        {level < 4 && horse.offspring && horse.offspring.length > 0 && (
          <>
            <Box
              sx={{
                width: '2px',
                height: '15px',
                backgroundColor: 'grey.300',
                my: 0.5
              }}
            />
            <Grid 
              container 
              spacing={1}
              sx={{
                width: 'fit-content',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  width: '80%',
                  height: '2px',
                  backgroundColor: 'grey.300',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              {horse.offspring.map((child, index) => (
                <Grid 
                  item 
                  key={child._id || index}
                  sx={{
                    minWidth: '120px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      width: '2px',
                      height: '10px',
                      backgroundColor: 'grey.300'
                    }
                  }}
                >
                  {renderDescendants(child, level + 1)}
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    );
  };

  return (
    <>
      <HorsePopover
        horse={hoveredHorse}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      />
      <Box sx={{ 
        p: 1,
        overflowX: 'auto',
        width: '100%',
        '& > *': {
          minWidth: type === 'descendants' ? '200px' : 'auto'
        }
      }}>
        {type === 'ancestors' ? renderAncestors(pedigree) : renderDescendants(pedigree)}
      </Box>
    </>
  );
};

export default PedigreeTree;
