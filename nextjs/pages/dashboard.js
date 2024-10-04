// pages/dashboard.js
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Paper, useTheme } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const DashboardPage = () => {
  const [playHistory, setPlayHistory] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingPlay, setLoadingPlay] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(true);
  const theme = useTheme(); // Access Material-UI theme

  useEffect(() => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      console.error('User ID not found in localStorage');
      setLoadingPlay(false);
      setLoadingLogin(false);
      return;
    }

    const fetchPlayHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/data/play-history/user/${user_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch play history data');
        }
        const data = await response.json();
        setPlayHistory(data);
      } catch (error) {
        console.error('Error fetching play history:', error);
      } finally {
        setLoadingPlay(false);
      }
    };

    const fetchLoginHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/data/login-history/user/${user_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch login history data');
        }
        const data = await response.json();
        setLoginHistory(data);
      } catch (error) {
        console.error('Error fetching login history:', error);
      } finally {
        setLoadingLogin(false);
      }
    };

    fetchPlayHistory();
    fetchLoginHistory();
  }, []);

  if (loadingPlay || loadingLogin) {
    return <CircularProgress color="primary" />;
  }

  // Data Processing for Play History
  const totalGames = playHistory.length;
  const gamesByMode = playHistory.reduce((acc, curr) => {
    acc[curr.mode] = (acc[curr.mode] || 0) + 1;
    return acc;
  }, {});

  const gamesByStatus = playHistory.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const avgMistakesByMode = playHistory.reduce((acc, curr) => {
    acc[curr.mode] = acc[curr.mode] || { total: 0, count: 0 };
    acc[curr.mode].total += curr.number_of_mistakes;
    acc[curr.mode].count += 1;
    return acc;
  }, {});

  const modeMistakes = Object.entries(avgMistakesByMode).map(([mode, data]) => ({
    mode,
    avgMistakes: (data.total / data.count).toFixed(2),
  }));

  // Data Processing for Login History by Weekday
  const loginsByWeekday = loginHistory.reduce((acc, curr) => {
    acc[curr.weekday] = (acc[curr.weekday] || 0) + 1;
    return acc;
  }, {});

  const loginsByWeekdayArray = Object.entries(loginsByWeekday).map(([weekday, count]) => ({
    weekday,
    count,
  }));

  const colors = ['#39FF14', '#FFA500', '#FF073A'];

  return (
    <Box sx={{ padding: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="h6" gutterBottom>
        Total Games Played: {totalGames}
      </Typography>

      <Grid container spacing={4}>
        {/* Games by Mode (Pie Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, backgroundColor: theme.palette.background.default }}>
            <Typography variant="h6" gutterBottom>
              Games by Mode
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={Object.entries(gamesByMode).map(([name, value], index) => ({
                    name, value, fill: colors[index]
                  }))}
                  dataKey="value" outerRadius={100}
                >
                  {Object.keys(gamesByMode).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Games by Status (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, backgroundColor: theme.palette.background.default }}>
            <Typography variant="h6" gutterBottom>
              Games by Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(gamesByStatus).map(([status, count]) => ({ status, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Mistakes by Mode (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, backgroundColor: theme.palette.background.default }}>
            <Typography variant="h6" gutterBottom>
              Average Mistakes by Mode
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modeMistakes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mode" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgMistakes" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Login Frequency by Weekday (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2, backgroundColor: theme.palette.background.default }}>
            <Typography variant="h6" gutterBottom>
              Login Frequency by Weekday
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loginsByWeekdayArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekday" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF073A" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
