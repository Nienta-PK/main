import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/UserTable.module.css';  // Import the CSS module

export default function UsersTable() {
  const [searchUsername, setSearchUsername] = useState(''); // Username search state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Handle error state
  const [sortingStatus, setSortingStatus] = useState('user_id'); // Sorting status
  const [reverseStatus, setReverseStatus] = useState(false); // Reverse sorting status

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

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.title}>User Search & Sorting</h1>

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

          {/* Show All button placed after Search button */}
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
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && !error && <p className={styles.noUsers}>No users found.</p>
        )}
      </div>
    </div>
  );
}
