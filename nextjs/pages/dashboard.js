import { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TaskIcon from '@mui/icons-material/Task';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error'; // New icon for missing tasks

// Mock API call function for stats and recent tasks
const fetchDashboardData = async () => {
  return {
    stats: {
      totalTasks: 450,
      completedTasks: 320,
    },
    recentTasks: [
      { id: 1, title: "Complete Project Proposal", is_completed: true },
      { id: 2, title: "Design Wireframe", is_completed: false },
      { id: 3, title: "Team Meeting", is_completed: true },
    ],
  };
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const loadDashboardData = async () => {
      const data = await fetchDashboardData();
      setDashboardData(data);
      setLoading(false);
    };
    loadDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update time every second

    // Clear the interval when component is unmounted
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Calculate missing tasks (total tasks - completed tasks)
  const missingTasks = dashboardData.stats.totalTasks - dashboardData.stats.completedTasks;

  return (
    <Container style={styles.container}>
      <Box style={styles.header}>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>

        {/* Display current date and time with icons */}
        <Box display="flex" alignItems="center" mt={2}>
          <DateRangeIcon style={styles.icon} />
          <Typography variant="h6" gutterBottom style={styles.date}>
            {currentDateTime.toLocaleDateString()}
          </Typography>
          <AccessTimeIcon style={styles.icon} />
          <Typography variant="h6" gutterBottom style={styles.time}>
            {currentDateTime.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Missing Tasks */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={styles.statCard}>
            <Tooltip title="Number of tasks that are not completed">
              <ErrorIcon style={styles.iconLarge} />
            </Tooltip>
            <Typography variant="h6" color="textSecondary">
              Missing Tasks
            </Typography>
            <Typography variant="h4">{missingTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={styles.statCard}>
            <Tooltip title="Total number of tasks created">
              <TaskIcon style={styles.iconLarge} />
            </Tooltip>
            <Typography variant="h6" color="textSecondary">
              Total Tasks
            </Typography>
            <Typography variant="h4">{dashboardData.stats.totalTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={styles.statCard}>
            <Tooltip title="Total number of completed tasks">
              <CheckCircleIcon style={styles.iconLarge} />
            </Tooltip>
            <Typography variant="h6" color="textSecondary">
              Completed Tasks
            </Typography>
            <Typography variant="h4">{dashboardData.stats.completedTasks}</Typography>
          </Paper>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12}>
          <Paper elevation={3} style={styles.paper}>
            <Typography variant="h6" gutterBottom>
              Recent Tasks
            </Typography>
            {dashboardData.recentTasks.length > 0 ? (
              dashboardData.recentTasks.map((task) => (
                <Typography key={task.id} variant="body1" style={styles.taskItem}>
                  {task.title} - {task.is_completed ? 'Completed' : 'Pending'}
                </Typography>
              ))
            ) : (
              <Typography variant="body1">No recent tasks available.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Paper elevation={3} style={styles.paper}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Button variant="contained" color="primary" style={styles.button}>
                Add New Task
              </Button>
              <Button variant="outlined" color="secondary" style={styles.button}>
                View All Tasks
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

const styles = {
  container: {
    marginTop: '30px',
    marginBottom: '30px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  icon: {
    marginRight: '8px',
    color: '#3f51b5',
  },
  iconLarge: {
    fontSize: '3rem',
    marginBottom: '10px',
    color: '#f44336', // Red color to indicate missing tasks
  },
  date: {
    marginRight: '20px',
  },
  time: {
    fontWeight: 'bold',
  },
  statCard: {
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
  },
  paper: {
    padding: '20px',
    backgroundColor: '#fff',
    textAlign: 'center',
    borderRadius: '10px',
  },
  taskItem: {
    padding: '5px 0',
  },
  button: {
    padding: '10px 20px',
  },
};
