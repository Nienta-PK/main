import React, { useState } from 'react';
import { Box, Typography, Button, Paper, TextField } from '@mui/material';
import axios from 'axios';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleManualLogin = async (e) => {
    e.preventDefault();  // Prevent default form submission

    try {
      // Create form data object for FastAPI
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // Send login request to FastAPI
      const response = await axios.post('http://localhost:8000/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // Store the token in localStorage
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Redirect to successfully login page
      window.location.href = "/successfully_login";
    } catch (err) {
      const errorResponse = err.response?.data;
      setError(errorResponse?.detail || "Login failed. Please try again.");
    }
  };

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
          Login
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        <form onSubmit={handleManualLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="text" onClick={() => setShowPassword(!showPassword)} sx={{ textTransform: 'none', marginBottom: '16px' }}>
            {showPassword ? "Hide Password" : "Show Password"}
          </Button>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
            Login
          </Button>
        </form>

        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Don't have an account?
          <Button href="/register" variant="text" sx={{ textTransform: 'none', padding: 0, marginLeft: 1 }}>
            Register
          </Button>
        </Typography>

        <Typography variant="body1" sx={{ marginTop: 2 }}>
          ----------------- Or Sign In With -----------------
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={() => signIn('google', { callbackUrl: '/successfully_login' })}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
}
