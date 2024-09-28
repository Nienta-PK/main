import React, { useState } from 'react';
import { Box, Typography, Button, Paper, TextField } from '@mui/material';
import axios from 'axios';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent the default form submission behavior

    try {
      // Create form data object
      const formData = new URLSearchParams();
      formData.append('username', email);  // FastAPI expects 'username', not 'email'
      formData.append('password', password);
  
      // Make a POST request to FastAPI's login endpoint with form data
      const response = await axios.post('http://localhost:8000/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',  // Send data as form-encoded
        },
      });
  
      // Destructure the access token from the response
      const { access_token } = response.data;
  
      // Store the token in localStorage for later use
      localStorage.setItem('token', access_token);
  
      // Redirect to the successfully login page after successful login
      window.location.href = "/successfully_login";
    } catch (err) {
      // Handle any errors received from the backend
      const errorResponse = err.response?.data;
      if (Array.isArray(errorResponse?.detail)) {
        // If error detail is an array, map and display each error message
        setError(errorResponse.detail.map((errItem) => errItem.msg).join(', '));
      } else {
        // Otherwise, just show the error message
        setError(errorResponse?.detail || "Login failed. Please try again.");
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
      <Paper
        elevation={3}
        sx={{ padding: 3, maxWidth: 400, width: '100%', borderRadius: 2 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Login
        </Typography>

        {/* Display error message if any */}
        {error && <Typography color="error">{error}</Typography>}

        <form onSubmit={handleLogin}>
          {/* Input field for Email */}
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Input field for Password with show/hide feature */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"} // Toggle password visibility
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Button to toggle password visibility */}
          <Button
            variant="text"
            onClick={() => setShowPassword(!showPassword)}
            sx={{ textTransform: 'none', marginBottom: '16px' }}
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </Button>

          {/* Login Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            Login
          </Button>
        </form>

        {/* Redirect to Register Page */}
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Don't have an account?
          <Button
            href="/register"
            variant="text"
            sx={{ textTransform: 'none', padding: 0, marginLeft: 1 }}
          >
            Register
          </Button>
        </Typography>

        <Typography variant="body1" sx={{ marginTop: 2 }}>
          ----------------- Or Sign In With -----------------
        </Typography>

        {/* Google Login Button */}
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
