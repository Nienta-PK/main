import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { CircularProgress, Button, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import withAuth from '@/hoc/withAuth';

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await axios.get(`http://localhost:8000/auth/get-user-info/${session.user.email}`);
          const { access_token, user_id, is_admin } = response.data;

          // Store data in localStorage
          localStorage.setItem('token', access_token);
          localStorage.setItem('user_id', user_id);
          localStorage.setItem('is_admin', is_admin);

          console.log('User data fetched and stored:', { access_token, user_id, is_admin });
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // If user not found, redirect to /register
            console.log(error.response.data.detail);  // Log the custom error message
            router.push('/register');  // Redirect to the registration page
          } else {
            console.error('Failed to fetch user info:', error);
          }
        }
      }
    };

    fetchUserInfo();
  }, [status, session, router]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (status === 'authenticated') {
        try {
          const res = await fetch('http://localhost:8000/tasks');
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          const data = await res.json();
          setTasks(data);
        } catch (error) {
          setErrorTasks(error.message);
        } finally {
          setLoadingTasks(false);
        }
      }
    };

    fetchTasks();
  }, [status]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <Box
      sx={{
        padding: '20px',
        width: '100%',
        height: '100vh',
        margin: '0',
        textAlign: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Typography variant="h2" gutterBottom>Welcome to the Daily Task Manager</Typography>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <Button variant="contained" color="primary" onClick={() => router.push('/tasks/create')}>Add New Task</Button>
        <Button variant="outlined" color="primary" onClick={() => router.push('/tasks/all')}>View All Tasks</Button>
      </div>

      <Typography variant="h4" gutterBottom>Your Recent Tasks</Typography>

      {loadingTasks ? (
        <CircularProgress />
      ) : errorTasks ? (
        <Typography color="error" variant="body1">{errorTasks}</Typography>
      ) : (
        <Grid container spacing={2}>
          {tasks.length > 0 ? (
            tasks.slice(0, 5).map((task) => (
              <Grid item key={task.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">{task.title}</Typography>
                    <Typography variant="body2">
                      {task.is_completed ? 'Completed' : 'Pending'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">No tasks available</Typography>
          )}
        </Grid>
      )}
    </Box>
  );
}

export default withAuth(Home);
