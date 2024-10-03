import React, { useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useSession } from 'next-auth/react';
import axios from 'axios';
import withAuth from '../hoc/withAuth';

function Home({ manualUser }) {
  const { data: session, status } = useSession();
  const user = session ? session.user : manualUser;

  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  if (!user) {
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
        <Typography variant="h5">Welcome, {user?.username}</Typography>
      </Paper>
    </Box>
  );
}

export default withAuth(Home);