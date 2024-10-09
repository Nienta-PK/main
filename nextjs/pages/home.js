import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '@/hoc/withAuth';

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Home Page</h1>
    </div>
  );
}

export default withAuth(Home);

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter for navigation
import { CircularProgress } from '@mui/material';

export default function Home() {  // Changed component name from Nah to Home
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter(); // Initialize router for navigation

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/tasks');
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to the task creation page
  const handleAddTask = () => {
    router.push('/tasks/create'); // Navigate to the task creation page
  };

  // Function to navigate to the all tasks page
  const handleViewAllTasks = () => {
    router.push('/tasks/all'); // Navigate to the all tasks page
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to the Daily Task Manager</h1>

      <div style={styles.actions}>
        <button style={styles.button} onClick={handleAddTask}>Add New Task</button>
        <button style={styles.buttonOutline} onClick={handleViewAllTasks}>View All Tasks</button>
      </div>

      <h2 style={styles.subtitle}>Your Recent Tasks</h2>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <p style={styles.errorText}>{error}</p>
      ) : (
        <div style={styles.taskGrid}>
          {tasks.length > 0 ? (
            tasks.slice(0, 5).map((task) => (
              <div key={task.id} style={styles.taskCard}>
                <h3 style={styles.taskTitle}>{task.title}</h3>
                <p style={styles.taskStatus}>
                  {task.is_completed ? 'Completed' : 'Pending'}
                </p>
              </div>
            ))
          ) : (
            <p>No tasks available</p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    color: '#333',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonOutline: {
    padding: '12px 20px',
    backgroundColor: '#fff',
    color: '#0070f3',
    border: '2px solid #0070f3',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  subtitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#555',
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  taskCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    padding: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'left',
  },
  taskTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  taskStatus: {
    fontSize: '1rem',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
};
