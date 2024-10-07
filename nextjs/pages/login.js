import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField } from '@mui/material';
import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession(); // Access session data

  const handleManualLogin = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post('http://localhost:8000/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, user_id, is_admin } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('is_admin', is_admin);
      window.location.href = "/home";
    } catch (err) {
      const errorResponse = err.response?.data;
      if (errorResponse?.detail) {
        setError(Array.isArray(errorResponse.detail) ? errorResponse.detail[0].msg : errorResponse.detail);
      } else {
        setError("Login failed. Please try again.");
      }
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
          onClick={() => signIn('google', { callbackUrl: '/home'})}
        >
          <GoogleIcon sx={{ marginRight: 2 }} />Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
}
