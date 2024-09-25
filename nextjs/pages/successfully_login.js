//---nextjs/pages/successfully_login.js---//
import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import withAuth from '../hoc/withAuth'; // Import the HOC for protected routes

function SuccessfullyLogin() {
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
        <Typography variant="h4" gutterBottom fontWeight="bold">Welcome!</Typography>
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          You have successfully logged in!
        </Typography>

        {/* Button to logout */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={() => {
            localStorage.removeItem('token'); // Remove the token from local storage
            window.location.href = '/login'; // Redirect to login page
          }}
        >
          Logout
        </Button>
      </Paper>
    </Box>
  );
}

export default withAuth(SuccessfullyLogin); // Wrap the component with the Auth HOC