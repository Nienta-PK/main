// pages/play-history.js
import { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, useTheme, CircularProgress } from '@mui/material';

const PlayHistoryPage = () => {
  const [playHistory, setPlayHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme(); // Access Material-UI theme

   useEffect(() => {
    const fetchPlayHistory = async () => {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        console.error('User ID not found in localStorage');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/data/play-history/user/${user_id}`); // Adjust URL as needed
        if (!response.ok) {
          throw new Error('Failed to fetch play history data');
        }
        const data = await response.json();
        setPlayHistory(data);
      } catch (error) {
        console.error('Error fetching play history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayHistory();
  }, []);

  return (
    <Box sx={{ padding: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' , background: theme.palette.background.default}}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        Play History
      </Typography>
      {loading ? (
        <CircularProgress color="primary" />
      ) : (
        <Paper sx={{ width: '100%', maxWidth: '1000px', padding: 2, borderRadius: 2, boxShadow: 3 }}>
          <TableContainer sx={{ borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="Play History Table">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Play ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Time to Finish</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Mode</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Mistakes</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playHistory.map((entry, index) => (
                    <TableRow
                    key={entry.play_id}
                    sx={{
                        backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                        '&:hover': { backgroundColor: theme.palette.action.selected },
                    }}
                    >
                    <TableCell>{entry.play_id}</TableCell>
                    <TableCell>{entry.user_id}</TableCell>
                    <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{entry.time_to_finish}</TableCell>

                    {/* Mode with Neon Colors */}
                    <TableCell
                        sx={{
                        fontWeight: 'bold',
                        color: entry.mode === 'easy' ? '#39FF14' : entry.mode === 'medium' ? '#FFA500' : '#FF073A',
                        textShadow: entry.mode === 'easy' 
                            ? '0 0 5px #39FF14, 0 0 10px #39FF14'
                            : entry.mode === 'medium' 
                            ? '0 0 5px #FFA500, 0 0 10px #FFA500'
                            : '0 0 5px #FF073A, 0 0 10px #FF073A'
                        }}
                    >
                        {entry.mode}
                    </TableCell>

                    <TableCell>{entry.number_of_mistakes}</TableCell>
                    
                    {/* Status with Neon Colors */}
                    <TableCell
                        sx={{
                        fontWeight: 'bold',
                        color: entry.status === 'completed' ? '#39FF14' : '#FF073A',
                        textShadow: entry.status === 'completed'
                            ? '0 0 5px #39FF14, 0 0 10px #39FF14'
                            : '0 0 5px #FF073A, 0 0 10px #FF073A'
                        }}
                    >
                        {entry.status}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default PlayHistoryPage;
