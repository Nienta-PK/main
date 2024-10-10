import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { CircularProgress, Button, Typography, Grid, Card, CardContent, Box, Chip, Divider, Paper } from '@mui/material';
import withAuth from '@/hoc/withAuth';
import moment from 'moment';

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [oneDayLeftTasks, setOneDayLeftTasks] = useState([]);
  const [oneWeekLeftTasks, setOneWeekLeftTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await axios.get(`http://localhost:8000/auth/get-user-info/${session.user.email}`);
          const { access_token, user_id, is_admin } = response.data;

          localStorage.setItem('token', access_token);
          localStorage.setItem('user_id', user_id);
          localStorage.setItem('is_admin', is_admin);

          console.log('User data fetched and stored:', { access_token, user_id, is_admin });
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(error.response.data.detail);
            router.push('/register');  
          } else {
            console.error('Failed to fetch user info:', error);
          }
        }
      }
    };

    fetchUserInfo();
  }, [status, session, router]);

  useEffect(() => {
    const fetchGroupedTasks = async () => {
      if (status === 'authenticated') {
        try {
          const response = await axios.get('http://localhost:8000/tasks/grouped');
          const data = response.data;

          const oneDayTasks = data.oneday_left.map(task => ({
            ...task,
            due_date: new Date(task.due_date),
          }));

          const oneWeekTasks = data.oneweek_left.map(task => ({
            ...task,
            due_date: new Date(task.due_date),
          }));

          setOneDayLeftTasks(oneDayTasks);
          setOneWeekLeftTasks(oneWeekTasks);
        } catch (error) {
          setErrorTasks(error.message);
        } finally {
          setLoadingTasks(false);
        }
      }
    };

    fetchGroupedTasks();
  }, [status]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOneDayLeftTasks(prevTasks =>
        prevTasks.map(task => ({
          ...task,
          time_remain: getTimeRemaining(task.due_date),
        }))
      );
      setOneWeekLeftTasks(prevTasks =>
        prevTasks.map(task => ({
          ...task,
          time_remain: getTimeRemaining(task.due_date),
          day_remain: getDaysRemaining(task.due_date),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [oneDayLeftTasks, oneWeekLeftTasks]);

  const getTimeRemaining = dueDate => {
    const now = new Date();
    const difference = dueDate - now;
    if (difference > 0) {
      return moment.utc(difference).format('HH:mm:ss');
    } else {
      return '00:00:00';
    }
  };

  const getDaysRemaining = dueDate => {
    const now = new Date();
    const difference = dueDate - now;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;  
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <Box
      sx={{
        padding: '20px',
        width: '100%',
        minHeight: '100vh',
        margin: '0',
        textAlign: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Typography variant="h3" gutterBottom>Daily Task Manager</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <Button variant="contained" color="primary" onClick={() => router.push('/tasks/create')}>Add New Task</Button>
        <Button variant="outlined" color="primary" onClick={() => router.push('/tasks/all')}>View All Tasks</Button>
      </Box>

      <Typography variant="h4" gutterBottom>Your Tasks</Typography>

      {loadingTasks ? (
        <CircularProgress />
      ) : errorTasks ? (
        <Typography color="error" variant="body1">{errorTasks}</Typography>
      ) : (
        <>
          {/* Tasks with One Day Left */}
          <Typography variant="h5" gutterBottom>Tasks with One Day Left</Typography>
          <Divider sx={{ marginBottom: '20px' }} />
          <Grid container spacing={2}>
            {oneDayLeftTasks.length > 0 ? (
              oneDayLeftTasks.map(task => (
                <Grid item key={task.task_id} xs={12} sm={6} md={4}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{task.title}</Typography>
                      <Typography variant="body2" color="textSecondary">{task.description || 'No description'}</Typography>
                      <Chip
                        label={`Time Remaining: ${task.time_remain}`}
                        color={task.time_remain === '00:00:00' ? 'error' : 'primary'}
                        sx={{ marginTop: '10px' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper
                  elevation={3}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '150px',
                    padding: '20px',
                  }}
                >
                  <Typography variant="h6">No tasks with one day left</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Tasks with One Week Left */}
          <Typography variant="h5" gutterBottom sx={{ marginTop: '30px' }}>Tasks with One Week Left</Typography>
          <Divider sx={{ marginBottom: '20px' }} />
          <Grid container spacing={2}>
            {oneWeekLeftTasks.length > 0 ? (
              oneWeekLeftTasks.map(task => (
                <Grid item key={task.task_id} xs={12} sm={6} md={4}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{task.title}</Typography>
                      <Typography variant="body2" color="textSecondary">{task.description || 'No description'}</Typography>
                      <Chip
                        label={`Days Remaining: ${task.day_remain}`}
                        color={task.day_remain <= 1 ? 'error' : 'primary'}
                        sx={{ marginTop: '10px' }}
                      />
                      <Chip
                        label={`Time Remaining: ${task.time_remain}`}
                        color={task.time_remain === '00:00:00' ? 'error' : 'primary'}
                        sx={{ marginTop: '10px' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper
                  elevation={3}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '150px',
                    padding: '20px',
                  }}
                >
                  <Typography variant="h6">No tasks with one week left</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
}

export default withAuth(Home);
