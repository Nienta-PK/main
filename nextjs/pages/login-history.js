// pages/login-history.js
import { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, useTheme } from '@mui/material';

const LoginHistoryPage = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchLoginHistory = async () => {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        console.error('User ID not found in localStorage');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/data/login-history/user/${user_id}`); // Adjust URL as needed
        if (!response.ok) {
          throw new Error('Failed to fetch login history data');
        }
        const data = await response.json();
        setLoginHistory(data);
      } catch (error) {
        console.error('Error fetching login history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoginHistory();
  }, []);

  return (
    <Box sx={{ padding: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        Login History
      </Typography>
      {loading ? (
        <CircularProgress color="primary" />
      ) : (
        <Paper sx={{ width: '100%', maxWidth: '800px', padding: 2, borderRadius: 2, boxShadow: 3 }}>
          <TableContainer>
            <Table sx={{ minWidth: 600 }} aria-label="Login History Table">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>Login ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>Day</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>Year</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>Weekday</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginHistory.map((entry, index) => (
                  <TableRow
                    key={entry.login_id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                      '&:hover': { backgroundColor: theme.palette.action.selected },
                    }}
                  >
                    <TableCell sx={{ textAlign: 'center' }}>{entry.login_id}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{entry.user_id}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{entry.time}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{entry.day}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{entry.month}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{entry.year}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{entry.weekday}</TableCell>
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

export default LoginHistoryPage;
