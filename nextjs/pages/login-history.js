import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import withAuth from '@/hoc/withAuth';

const LoginHistoryPage = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (!isAdmin) {
      router.push('/home'); // Redirect to home if not admin
    }
    const fetchLoginHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/data/login-history`);
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

  // Prepare data for the charts
  const loginCountsByDay = loginHistory.reduce((acc, entry) => {
    acc[entry.day] = (acc[entry.day] || 0) + 1;
    return acc;
  }, {});

  const loginCountsByMonth = loginHistory.reduce((acc, entry) => {
    acc[entry.month] = (acc[entry.month] || 0) + 1;
    return acc;
  }, {});

  const dayData = Object.keys(loginCountsByDay).map((day) => ({
    day,
    count: loginCountsByDay[day],
  }));

  const monthData = Object.keys(loginCountsByMonth).map((month) => ({
    month,
    count: loginCountsByMonth[month],
  }));

  return (
    <Box
      sx={{
        padding: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: 'background.default'
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
      >
        Login History
      </Typography>
      
      {/* Table Rendering */}
      {loading ? (
        <CircularProgress color="primary" />
      ) : (
        <>
          <Paper sx={{ width: '100%', maxWidth: '800px', padding: 2, borderRadius: 2, boxShadow: 3, marginBottom: 4 }}>
            <TableContainer>
              <Table sx={{ minWidth: 600 }} aria-label="Login History Table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>
                      Login ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>
                      User ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>
                      Time
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>
                      Day
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>
                      Month
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>
                      Year
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText, textAlign: 'center' }}>
                      Weekday
                    </TableCell>
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

          {/* Dashboard Rendering */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Login Count by Day
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Login Count by Month
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default withAuth(LoginHistoryPage);
