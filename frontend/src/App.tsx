import React, { useEffect, useState } from 'react';
import { 
  Container, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  Divider 
} from '@mui/material';
import { blue, grey, green } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create the dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

type Player = {
  id: number;
  rank: number;
  player_name: string;
  age: number;
  hits: number;
  year: number;
  bats: string;
  description?: string;
};

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Player>>({});

  // Fetch the data from the backend API
  const getData = async () => {
    try {
      console.log('Fetching and correcting data...');
      await fetch('/fetch-and-correct-data');
      console.log('Fetching players...');
      const resp = await fetch('/players');
      const json = await resp.json();
      console.log('Players fetched:', json);

      // Sort players first by year (descending) and then by hits (descending)
      const sortedPlayers = json.sort((a: Player, b: Player) => {
        if (b.year !== a.year) {
          return b.year - a.year; // Sort by year first (most recent first)
        }
        return b.hits - a.hits; // Then sort by hits (most hits first)
      });

      setPlayers(sortedPlayers);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handlePlayerClick = async (player: Player) => {
    console.log('Player clicked:', player);
    
    try {
        const resp = await fetch(`/player/${player.id}`);
        const updatedPlayer = await resp.json();

        setSelectedPlayer(updatedPlayer);
        setEditData(updatedPlayer);
    } catch (err) {
        console.error('Failed to fetch player details:', err);
    }
};


  const handleInputChange = (field: keyof Player, value: string | number) => {
    setEditData(prevData => ({
      ...prevData,
      [field]: value,
    }));
    console.log('Updated edit data:', { ...editData, [field]: value });
  };

  const fetchLLMDescription = async (player: Partial<Player>) => {
    try {
        const response = await fetch(`http://localhost:5001/generate-description`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(player),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch LLM-generated description.');
        }

        const result = await response.json();
        
        // Log the description fetched to ensure it's not null
        console.log('Fetched LLM description:', result.description);

        return result.description;

    } catch (error) {
        console.error('Failed to fetch LLM-generated description:', error);
        return '';
    }
};

const handleSave = async () => {
  if (selectedPlayer && editData) {
      const updatedData = { ...editData };

      // Fetch the LLM-generated description before saving
      updatedData.description = await fetchLLMDescription(editData);

      if (updatedData.description) {
          console.log('Saving updated player data:', updatedData);

          fetch(`/player/${selectedPlayer.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedData),
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to update player.');
              }
              console.log('Player update response received:', response);

              // Update the selectedPlayer state with the new data
              setSelectedPlayer(prev => ({
                  ...prev!,
                  ...updatedData,
              }));

              // Re-fetch the updated player data to reflect the changes in the UI
              getData();
              setEditDialogOpen(false);
          })
          .catch((error) => console.error('Error updating player:', error));
      } else {
          console.error('Failed to generate LLM description, player data not saved.');
      }
  }
};

  return (
    <Container sx={{ paddingTop: '2rem' }}>
      <Typography variant="h3" gutterBottom align="center" color={blue[700]}>
        Baseball Players Ranked by Hits
      </Typography>
      <Typography variant="h6" gutterBottom align="center" color={grey[600]}>
        (Recent Years First)
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <List sx={{ 
            backgroundColor: grey[100], 
            borderRadius: '8px', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            maxHeight: '70vh'
          }}>
            {players.map((player, index) => (
              <React.Fragment key={player.id}>
                {(index === 0 || player.year !== players[index - 1].year) && (
                  <Divider sx={{ margin: '0.5rem 0' }} />
                )}
                <ListItem 
                  button 
                  onClick={() => handlePlayerClick(player)}
                  sx={{ 
                    padding: '1rem',
                    backgroundColor: index % 2 === 0 ? grey[50] : grey[100],
                    '&:hover': {
                      backgroundColor: blue[50],
                    },
                    borderBottom: `1px solid ${grey[300]}`,
                  }}
                >
                  <ListItemText 
                    primary={`Year: ${player.year} | Rank: ${player.rank}`} 
                    secondary={`${player.player_name}, Hits: ${player.hits}`} 
                    primaryTypographyProps={{ color: blue[900], fontWeight: 'bold' }}
                    secondaryTypographyProps={{ color: grey[800] }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Grid>

        {selectedPlayer && (
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              borderRadius: '8px', 
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              backgroundColor: grey[50]
            }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color={blue[800]}>
                  {selectedPlayer.player_name}
                </Typography>
                <Typography variant="body1" paragraph color={grey[700]}>
                  {selectedPlayer.description}
                </Typography>
                <Typography variant="body2" color={grey[600]}>
                  Rank: {selectedPlayer.rank}
                </Typography>
                <Typography variant="body2" color={grey[600]}>
                  Hits: {selectedPlayer.hits}
                </Typography>
                <Typography variant="body2" color={grey[600]}>
                  Age: {selectedPlayer.age}
                </Typography>
                <Typography variant="body2" color={grey[600]}>
                  Year: {selectedPlayer.year}
                </Typography>
                <Typography variant="body2" color={grey[600]}>
                  Bats: {selectedPlayer.bats}
                </Typography>
              </CardContent>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setEditDialogOpen(true)}
                sx={{ 
                  margin: '1rem',
                  backgroundColor: blue[500],
                  '&:hover': {
                    backgroundColor: blue[700],
                  }
                }}
              >
                Edit
              </Button>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1300,  // Ensure the dialog stays on top
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <DialogTitle>Edit Player Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Player Name"
            fullWidth
            margin="normal"
            variant="outlined"
            value={editData.player_name || ''}
            onChange={(e) => handleInputChange('player_name', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Age"
            fullWidth
            margin="normal"
            variant="outlined"
            type="number"
            value={editData.age || ''}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value, 10))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hits"
            fullWidth
            margin="normal"
            variant="outlined"
            type="number"
            value={editData.hits || ''}
            onChange={(e) => handleInputChange('hits', parseInt(e.target.value, 10))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Year"
            fullWidth
            margin="normal"
            variant="outlined"
            type="number"
            value={editData.year || ''}
            onChange={(e) => handleInputChange('year', parseInt(e.target.value, 10))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Bats"
            fullWidth
            margin="normal"
            variant="outlined"
            value={editData.bats || ''}
            onChange={(e) => handleInputChange('bats', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" sx={{ backgroundColor: green[500], '&:hover': { backgroundColor: green[700] } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default App;
