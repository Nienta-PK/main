import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';  // Import the useRouter hook from Next.js
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';  // Import the Delete icon from Material-UI
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';  // Import MUI Dialog components
import styles from '../styles/UserTable.module.css';  // Import the CSS module
import withAuth from '@/hoc/withAuth';

function UsersTable() {
  const [searchUsername, setSearchUsername] = useState(''); // Username search state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Handle error state
  const [sortingStatus, setSortingStatus] = useState('user_id'); // Sorting status
  const [reverseStatus, setReverseStatus] = useState(false); // Reverse sorting status
  const [userToDelete, setUserToDelete] = useState(null);  // Store user_id of the user to delete
  const [openDialog, setOpenDialog] = useState(false);  // Control the display of the MUI Dialog

  const router = useRouter();  // Initialize useRouter to handle redirects

  // Check if the user is an admin
  useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin');

    // If not an admin, redirect to /home
    if (isAdmin === 'false'|| !isAdmin) {
      router.push('/home');  // Redirect to the /home page
    }
  }, []);

  // Function to fetch users based on username, with sorting and reverse status
  const fetchUsers = async (username = '') => {
    setLoading(true);
    setError(null); // Clear error before new request
    try {
      const response = await axios.get(`http://localhost:8000/algo/all_users`, {
        params: {
          username: username, // Search by username if provided
          sorting_status: sortingStatus, // Sorting status
          reverse_status: reverseStatus, // Reverse sorting status
        },
      });
      setUsers(response.data);  // Set users in state
      setLoading(false);
    } catch (err) {
      setError(err);  // Set error message from the backend
      setLoading(false);
    }
  };

  // Fetch users with an empty username on page load
  useEffect(() => {
    fetchUsers(searchUsername);  // Use current searchUsername whenever sorting changes
  }, [sortingStatus, reverseStatus]);  // Trigger when sorting or reverse status changes

  // Handler for the search input
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchUsername);  // Fetch users based on searchUsername
  };

  // Toggle reverse status
  const toggleReverseStatus = () => {
    setReverseStatus(!reverseStatus);
  };

  // Function to reset filters (Clear all filters)
  const showAll = () => {
    setSearchUsername('');  // Clear the search term
    setSortingStatus('user_id');  // Reset sorting status to default (user_id)
    setReverseStatus(false);  // Reset reverse status to default (false)
    fetchUsers();  // Fetch all users without filters
  };

  // Open the dialog to confirm deletion
  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);  // Set the user_id of the user to be deleted
    setOpenDialog(true);  // Show the confirmation dialog
  };

  // Handle user deletion after confirmation
  const deleteUser = async () => {
    if (userToDelete) {
      try {
        await axios.delete(`http://localhost:8000/algo/delete_user/${userToDelete}`);
        setUsers(users.filter(user => user.user_id !== userToDelete));  // Update the user list
        setOpenDialog(false);  // Close the dialog
      } catch (err) {
        console.error("Failed to delete user:", err);
        setOpenDialog(false);
      }
    }
  };

  // Close the dialog without deletion
  const handleClose = () => {
    setOpenDialog(false);  // Close the dialog without deleting
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.title}>User Management</h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input 
            type="text"
            placeholder="Enter Username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)} // Update searchUsername on input change
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Search</button>
          <button type="button" onClick={showAll} className={styles.showAllButton}>Show All</button>
        </form>

        {/* Sorting options */}
        <div className={styles.sortingOptions}>
          <label className={styles.label}>Sort by: </label>
          <select value={sortingStatus} onChange={(e) => setSortingStatus(e.target.value)} className={styles.dropdown}>
            <option value="user_id">User ID</option>
            <option value="username">Username</option>
            <option value="create_date">Create Date</option>
            <option value="is_admin">Admin Status</option>
          </select>

          {/* Reverse sort button */}
          <button onClick={toggleReverseStatus} className={styles.sortButton}>
            {reverseStatus ? 'Ascending' : 'Descending'}
          </button>
        </div>

        {/* Loading or Error handling */}
        {loading && <p className={styles.loading}>Loading...</p>}
        {error && <p className={styles.error}>Error: {error.response?.data?.detail || error.message}</p>}

        {/* User Table */}
        {!loading && !error && users.length > 0 ? (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Is Active</th>
                <th>Is Admin</th>
                <th>Create Date</th>
                <th>Action</th> {/* New column for action */}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.is_active ? 'Yes' : 'No'}</td>
                  <td>{user.is_admin ? 'Yes' : 'No'}</td>
                  <td>{user.create_date}</td>
                  <td>
                    <DeleteForeverIcon 
                      className={styles.removeIcon} 
                      onClick={() => handleDeleteClick(user.user_id)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && !error && <p className={styles.noUsers}>No users found.</p>
        )}

        {/* MUI Dialog for confirming deletion */}
        <Dialog
          open={openDialog}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={deleteUser} color="error" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default withAuth(UsersTable);