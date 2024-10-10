import { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TaskIcon from '@mui/icons-material/Task';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, ResponsiveContainer } from 'recharts';
import styles from '../styles/Dashboard.module.css';
import axios from 'axios'; // Import axios

// API call function to fetch data using axios, including user_id from localStorage
const fetchDashboardData = async () => {
  try {
    const user_id = localStorage.getItem('user_id'); // Retrieve user_id from localStorage

    if (!user_id) {
      throw new Error('User ID not found in localStorage');
    }

    const response = await axios.get(`http://localhost:8000/algo/tasks-overview`, {
      params: {
        user_id: user_id, // Pass user_id as a query parameter
      },
    });

    console.log("API Response:", response);  // Log the full response for debugging
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error.response ? error.response.data : error.message);  // Log detailed error info
    return null;
  }
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  useEffect(() => {
    const loadDashboardData = async () => {
      const data = await fetchDashboardData();
      if (data) {
        setDashboardData(data);
      }
      setLoading(false);
    };
    loadDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update time every second

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData || !dashboardData.tasks || !dashboardData.category_counts || !dashboardData.priority_counts || !dashboardData.status_counts) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          Failed to load dashboard data.
        </Typography>
      </Box>
    );
  }

  // Defensive checks to avoid undefined length error
  const totalTasks = dashboardData.tasks ? dashboardData.tasks.length : 0;
  const completedTasks = dashboardData.tasks
    ? dashboardData.tasks.filter(task => task.status === 'Completed').length
    : 0;
  const missingTasks = totalTasks - completedTasks;

  // Data for charts (with default empty arrays if undefined)
  const categoryData = dashboardData.category_counts
    ? Object.entries(dashboardData.category_counts).map(([name, value]) => ({ name, value }))
    : [];
  const priorityData = dashboardData.priority_counts
    ? Object.entries(dashboardData.priority_counts).map(([name, value]) => ({ name, value }))
    : [];
  const statusData = dashboardData.status_counts
    ? Object.entries(dashboardData.status_counts).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#121212"  // Example background color for the whole page
    >
      <Container className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h4" gutterBottom>
            Dashboard Overview
          </Typography>

          {/* Display current date and time with icons */}
          <Box display="flex" alignItems="center" mt={2}>
            <DateRangeIcon className={styles.icon} />
            <Typography variant="h6" gutterBottom className={styles.date}>
              {currentDateTime.toLocaleDateString()}
            </Typography>
            <AccessTimeIcon className={styles.icon} />
            <Typography variant="h6" gutterBottom className={styles.time}>
              {currentDateTime.toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Missing Tasks */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className={styles.statCard}>
              <Tooltip title="Number of tasks that are not completed">
                <ErrorIcon className={styles.iconLarge} />
              </Tooltip>
              <Typography variant="h6" color="textSecondary">
                Missing Tasks
              </Typography>
              <Typography variant="h4">{missingTasks}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className={styles.statCard}>
              <Tooltip title="Total number of tasks created">
                <TaskIcon className={styles.iconLarge} />
              </Tooltip>
              <Typography variant="h6" color="textSecondary">
                Total Tasks
              </Typography>
              <Typography variant="h4">{totalTasks}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className={styles.statCard}>
              <Tooltip title="Total number of completed tasks">
                <CheckCircleIcon className={styles.iconLarge} />
              </Tooltip>
              <Typography variant="h6" color="textSecondary">
                Completed Tasks
              </Typography>
              <Typography variant="h4">{completedTasks}</Typography>
            </Paper>
          </Grid>

          {/* Chart for Task Distribution by Category */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className={styles.statCard}>
              <Typography variant="h6" color="textSecondary">
                Task Distribution by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Chart for Task Distribution by Priority */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className={styles.statCard}>
              <Typography variant="h6" color="textSecondary">
                Task Distribution by Priority
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Chart for Task Distribution by Status */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className={styles.statCard}>
              <Typography variant="h6" color="textSecondary">
                Task Distribution by Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
