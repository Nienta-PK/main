import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import withAuth from '@/hoc/withAuth';

const Account = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    created_at: '',
  });
  const [editMode, setEditMode] = useState({
    username: false,
    email: false,
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUserData();  // Fetch data when the component mounts
  }, []);

  const fetchUserData = async () => {
    try {
        setLoading(true);

        const token = localStorage.getItem('token');
        const user_id = localStorage.getItem('user_id');  // Get user_id from localStorage

        if (!token || !user_id) {
            throw new Error('No token or user_id found');
        }

        const response = await axios.get(`http://localhost:8000/crud/users/${user_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setUserData(response.data);
    } catch (error) {
        // Log the full error object to see everything
        console.error('Error fetching user data:', error);

        // Log individual parts of the error for detailed inspection
        console.error('Error Message:', error.message);
        console.error('Error Response:', error.response);
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
        const errorMessage = 
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.response?.data?.status ||
            'Failed to fetch user data';
            
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        console.error('Error fetching user data:', error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdate = async (field) => {
    try {
        const updatedData = {};
        if (field === 'username') {
            updatedData.username = userData.username;
        } else if (field === 'email') {
            updatedData.email = userData.email;
        }

        const token = localStorage.getItem('token');
        const user_id = localStorage.getItem('user_id');

        const response = await axios.put(
            `http://localhost:8000/crud/users/${user_id}`,
            updatedData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const newToken = response.data.access_token;
        if (newToken) {
            localStorage.setItem('token', newToken);
        }

        setEditMode((prev) => ({ ...prev, [field]: false }));
        setSnackbar({ open: true, message: `${field.charAt(0).toUpperCase() + field.slice(1)} Updated`, severity: 'success' });
        fetchUserData();
        
    } catch (error) {
        const errorMessage = 
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.response?.data?.status ||
            'Failed to update user data';

        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        console.error('Error updating user data:', error.message);
    }
  };

  const handleEditToggle = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFieldChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="background.default"
    >
      <Paper elevation={1} sx={{ padding: 2, maxWidth: 800, width: '100%', display: 'flex' }}>
        <Box sx={{ marginRight: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            alt="rainbow cat"
            src="/images/rainbow-cat.png"
            style={{ width: 80, height: 80, borderRadius: '50%' }}
          />
          <Typography variant="subtitle1" mt={1}>
            {userData.username}
          </Typography>
        </Box>
        <Box component="form" sx={{ flexGrow: 1 }}>
          <Box mb={2} display="flex" alignItems="center">
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Username</Typography>
            <IconButton onClick={() => editMode.username ? handleUpdate('username') : handleEditToggle('username')} size="small">
              {editMode.username ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
          </Box>
          <TextField
            name="username"
            variant="outlined"
            fullWidth
            size="small"
            disabled={!editMode.username}
            value={userData.username}
            onChange={(e) => handleFieldChange('username', e.target.value)}
          />

          <Box mb={2} mt={2} display="flex" alignItems="center">
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Email</Typography>
            <IconButton onClick={() => editMode.email ? handleUpdate('email') : handleEditToggle('email')} size="small">
              {editMode.email ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
          </Box>
          <TextField
            name="email"
            variant="outlined"
            fullWidth
            size="small"
            disabled={!editMode.email}
            value={userData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />

          <Box mb={2} mt={2}>
            <Typography variant="subtitle2">Created At</Typography>
            <TextField
              variant="outlined"
              fullWidth
              size="small"
              disabled
              value={new Date(userData.created_at).toLocaleString()}
            />
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for error/success message */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default withAuth(Account);
