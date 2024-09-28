// --- pages/successfully_login.js ---
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { signOut, useSession } from 'next-auth/react';
import axios from 'axios';
import withAuth from '../hoc/withAuth';

function SuccessfullyLogin() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');  // Check for manual token

    if (!session && token) {
      // If logged in manually, fetch user data with the token
      axios.get('http://localhost:8000/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';  // Redirect if token is invalid
      });
    } else if (session) {
      setUser(session.user);  // Use session user for Google login
    }
  }, [session]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session && !user) {
    return <div>Redirecting...</div>;
  }

  return (
    <Box
      textAlign="center"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Paper elevation={3} sx={{ padding: 3, maxWidth: 400, width: '100%', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome, {session ? session.user?.name : user?.username || 'User'}!
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          You have successfully logged in!
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={() => {
            localStorage.removeItem('token');  // Clear manual token
            signOut({ callbackUrl: '/login' });  // Sign out from Google login as well
          }}
        >
          Logout
        </Button>
      </Paper>
    </Box>
  );
}

export default withAuth(SuccessfullyLogin);
