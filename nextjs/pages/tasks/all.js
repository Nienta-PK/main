import { useEffect, useState } from 'react';
import axios from 'axios';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DoneIcon from '@mui/icons-material/Done';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert
} from '@mui/material';
import styles from '../../styles/UserTable.module.css';
import withAuth from '@/hoc/withAuth';

function TasksTable() {
  const [searchTitle, setSearchTitle] = useState(''); // Title search state
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);  // State for category options
  const [priorities, setPriorities] = useState([]);  // State for priority options
  const [statuses, setStatuses] = useState([]);      // State for status options
  const [selectedCategory, setSelectedCategory] = useState(''); // For selected category
  const [selectedStatus, setSelectedStatus] = useState('Ongoing');  // For selected status
  const [selectedPriority, setSelectedPriority] = useState('');  // For selected priority
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Handle error state
  const [errorMessage, setErrorMessage] = useState(''); // Handle error message for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State to show/hide Snackbar
  const [sortingStatus, setSortingStatus] = useState('task_id'); // Sorting status
  const [reverseStatus, setReverseStatus] = useState(false); // Reverse sorting status
  const [taskToDelete, setTaskToDelete] = useState(null);  // Store task_id of the task to delete
  const [openDialog, setOpenDialog] = useState(false);  // Control the display of the MUI Dialog

  // Function to show the Snackbar with an error message
  const handleSnackbarOpen = (message) => {
    setErrorMessage(message);
    setSnackbarOpen(true);
  };

  // Function to close the Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Fetch tasks based on title, sorting, category, status, and priority
  const fetchTasks = async (title = '') => {
    setLoading(true);
    setError(null); // Clear error before new request
    try {
      const response = await axios.get(`http://localhost:8000/algo/get-all-tasks`, {
        params: {   
          user_id: localStorage.getItem('user_id'),
          title: title,  // Search by title if provided
          sorting_status: sortingStatus, // Sorting status
          reverse_status: reverseStatus, // Reverse sorting status
          category: selectedCategory, // Filter by category
          status: selectedStatus,  // Filter by status
          priority: selectedPriority // Filter by priority
        },
      });
      setTasks(response.data);  // Set tasks in state
      setLoading(false);
    } catch (err) {
      setError(err);  // Set error message from the backend
      handleSnackbarOpen(err.message); // Show error in Snackbar
      setLoading(false);
    }
  };

  // Fetch categories, priorities, and statuses for dropdowns
  const fetchDropdownOptions = async () => {
    try {
      const [categoriesRes, prioritiesRes, statusesRes] = await Promise.all([
        axios.get('http://localhost:8000/algo/categories'),
        axios.get('http://localhost:8000/algo/priorities'),
        axios.get('http://localhost:8000/algo/statuses')
      ]);
      setCategories(categoriesRes.data);
      setPriorities(prioritiesRes.data);
      setStatuses(statusesRes.data);
    } catch (err) {
      console.error('Failed to fetch dropdown options:', err);
      handleSnackbarOpen('Failed to fetch dropdown options');
    }
  };

  // Fetch tasks and dropdown options on page load
  useEffect(() => {
    fetchTasks(searchTitle);  // Use current searchTitle whenever sorting changes
    fetchDropdownOptions();  // Fetch categories, priorities, and statuses for dropdown
  }, [sortingStatus, reverseStatus, selectedCategory, selectedStatus, selectedPriority]);  // Trigger when sorting, category, status, or priority changes

  // Handler for the search input
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks(searchTitle);  // Fetch tasks based on searchTitle
  };

  // Toggle reverse status
  const toggleReverseStatus = () => {
    setReverseStatus(!reverseStatus);
  };

  // Function to reset filters (Clear all filters)
  const showAll = () => {
    setSearchTitle('');  // Clear the search term
    setSortingStatus('task_id');  // Reset sorting status to default (task_id)
    setReverseStatus(false);  // Reset reverse status to default (false)
    setSelectedCategory('');  // Reset category filter
    setSelectedStatus('');  // Reset status filter
    setSelectedPriority('');  // Reset priority filter
    fetchTasks();  // Fetch all tasks without filters
  };

  // Open the dialog to confirm deletion
  const handleDeleteClick = (taskId) => {
    setTaskToDelete(taskId);  // Set the task_id of the task to be deleted
    setOpenDialog(true);  // Show the confirmation dialog
  };

  const handleTaskFinish = async (taskId) => {
    try {
      const response = await axios.put(`http://localhost:8000/algo/complete-task/${taskId}`);
      const updatedTask = response.data;  // Get the updated task data from the response

      console.log(`Task with ID ${taskId} marked as ${updatedTask.status}`);

      // Update the task status in the local state based on the server response
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.task_id === taskId ? { ...task, status: updatedTask.status } : task
        )
      );
    } catch (error) {
      console.error("Failed to mark task as completed", error);
      handleSnackbarOpen("Failed to mark task as completed"); // Show error in Snackbar
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await axios.put(`http://localhost:8000/algo/abandon-task/${taskId}`);
      console.log(`Task with ID ${taskId} marked as abandoned`);

      // Update the task status to "Abandoned" in the local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.task_id === taskId ? { ...task, status: 'Abandoned' } : task
        )
      );
      setOpenDialog(false); 
    } catch (error) {
      console.error("Failed to mark task as abandoned", error);
      handleSnackbarOpen("Failed to mark task as abandoned"); // Show error in Snackbar
      setOpenDialog(false); 
    }
  };

  // Close the dialog without deletion
  const handleClose = () => {
    setOpenDialog(false);  // Close the dialog without deleting
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.title}>Task Management</h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input 
            type="text"
            placeholder="Enter Task Title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)} // Update searchTitle on input change
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Search</button>
          <button type="button" onClick={showAll} className={styles.showAllButton}>Show All</button>
        </form>

        {/* Sorting and filtering options */}
        <div className={styles.sortingOptions}>
          <label className={styles.label}>Sort by: </label>
          <select value={sortingStatus} onChange={(e) => setSortingStatus(e.target.value)} className={styles.dropdown}>
            <option value="task_id">Task ID</option>
            <option value="title">Title</option>
            <option value="due_date">Due Date</option>
            <option value="is_important">Important Status</option>        
          </select>

          {/* Category dropdown */}
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.category_id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status dropdown */}
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status.status_id} value={status.name}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Priority dropdown */}
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="priority-select-label">Priority</InputLabel>
            <Select
              labelId="priority-select-label"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {priorities.map((priority) => (
                <MenuItem key={priority.priority_id} value={priority.name}>
                  {priority.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Reverse sort button */}
          <button onClick={toggleReverseStatus} className={styles.sortButton}>
            {reverseStatus ? 'Ascending' : 'Descending'}
          </button>
        </div>

        {/* Loading or Error handling */}
        {loading && <p className={styles.loading}>Loading...</p>}
        {error && <p className={styles.error}>Error: {error.response?.data?.detail || error.message}</p>}

        {/* Task Table */}
        {!loading && !error && tasks.length > 0 ? (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Is Important</th>
                <th>Category</th> {/* Add a column to show category */}
                <th>Status</th>  {/* Add a column to show status */}
                <th>Priority</th> {/* Add a column to show priority */}
                <th>Done</th> {/* New column for action */}
                <th>Abandon</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.task_id}>
                  <td>{task.task_id}</td>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.due_date}</td>
                  <td>{task.is_important ? 'Yes' : 'No'}</td>
                  <td>{task.category}</td>  {/* Show the task category */}
                  <td>{task.status}</td>  {/* Show the task status */}
                  <td>{task.priority}</td>  {/* Show the task priority */}
                  <td className={styles.actionButtons}>
                    <DoneIcon 
                      className={styles.finishIcon} 
                      onClick={() => handleTaskFinish(task.task_id)} 
                    />
                  </td>
                  <td className={styles.actionButtons}>
                    <DeleteForeverIcon 
                      className={styles.removeIcon} 
                      onClick={() => handleDeleteClick(task.task_id)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && !error && <p className={styles.noUsers}>No tasks found.</p>
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
              Are you sure you want to "Abandoned" this task? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={() => deleteTask(taskToDelete)} color="error" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for errors */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}
export default withAuth(TasksTable);