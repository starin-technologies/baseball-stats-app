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
          .catch((error) => console.error('Error updating player: