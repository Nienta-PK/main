// --- pages/successfully_login.js ---
import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { signOut, useSession } from 'next-auth/react';
import withAuth from '../hoc/withAuth'; // Adjust the import path if necessary

function SuccessfullyLogin() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    // Shouldn't reach here due to withAuth, but handle gracefully
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
      <Paper
        elevation={3}
        sx={{ padding: 3, maxWidth: 400, width: '100%', borderRadius: 2 }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome, {session.user?.name || 'User'}!
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          You have successfully logged in!
        </Typography>

        {/* Button to logout */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Logout
        </Button>
      </Paper>
    </Box>
  );
}

export default withAuth(SuccessfullyLogin);
