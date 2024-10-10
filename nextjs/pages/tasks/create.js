import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  CircularProgress,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(''); // For due date
  const [dueTime, setDueTime] = useState(''); // For due time
  const [isImportant, setIsImportant] = useState(false); // State for the important checkbox
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [categoryId, setCategoryId] = useState(''); // Selected category_id
  const [priorityId, setPriorityId] = useState(''); // Selected priority_id
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Use Next.js router for navigation

  useEffect(() => {
    // Fetch categories, priorities, and statuses from the backend
    const fetchData = async () => {
      try {
        const [categoriesRes, prioritiesRes] = await Promise.all([
          fetch('http://localhost:8000/algo/categories'),
          fetch('http://localhost:8000/algo/priorities'),
        ]);

        if (!categoriesRes.ok || !prioritiesRes.ok) {
          throw new Error('Failed to fetch select options.');
        }

        const categoriesData = await categoriesRes.json();
        const prioritiesData = await prioritiesRes.json();

        setCategories(categoriesData);
        setPriorities(prioritiesData);
      } catch (error) {
        console.error(error);
        setError('Failed to load form options.');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (title.trim() === '') {
      setError('Task title is required.');
      setLoading(false);
      return;
    }

    // Get the user_id from localStorage
    const user_id = localStorage.getItem('user_id'); // Assumes user_id is stored in localStorage

    if (!user_id) {
      setError('User not logged in.');
      setLoading(false);
      return;
    }

    const taskData = {
      user_id,
      title,
      description,
      due_date: dueDate,
      due_time: dueTime,
      is_important: isImportant,
      category_id: categoryId,
      priority_id: priorityId,
    };

    try {
      const res = await fetch('http://localhost:8000/algo/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization header if needed
        },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {    
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      // Navigate to home.js after task creation
      router.push('/home'); // Redirect to home.js
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 200, // Set maxHeight for the menu
      },
    },
  };

  return (
    <Box
      sx={{
        padding: 1,
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ padding: 2, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom align="center" sx={{ marginBottom: 1 }}>
          Create Task
        </Typography>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <TextField
            fullWidth
            required
            label="Task Title "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            margin="dense"
            size="small"
            sx={{ marginBottom: 1 }} // Reduced vertical spacing
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)"
            multiline
            rows={2}
            margin="dense"
            size="small"
            sx={{ marginBottom: 1 }} // Reduced vertical spacing
          />

          <FormControl fullWidth margin="dense" size="small" sx={{ marginBottom: 1 }}>
            <InputLabel id="categoryLabel">Category *</InputLabel>
            <Select
              labelId="categoryLabel"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              MenuProps={menuProps} // Add scrollbar if menu exceeds height
            >
              {categories.map((category) => (
                <MenuItem key={category.category_id} value={category.category_id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" size="small" sx={{ marginBottom: 1 }}>
            <InputLabel id="priorityLabel">Priority *</InputLabel>
            <Select
              labelId="priorityLabel"
              value={priorityId}
              onChange={(e) => setPriorityId(e.target.value)}
              required
              MenuProps={menuProps} // Add scrollbar if menu exceeds height
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.priority_id} value={priority.priority_id}>
                  {priority.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              required
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              margin="dense"
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ marginBottom: 1 }} // Reduced vertical spacing
            />
            <TextField
              fullWidth
              required
              label="Due Time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              margin="dense"
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ marginBottom: 1 }} // Reduced vertical spacing
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                color="primary"
              />
            }
            label="Mark as Important"
            sx={{ marginBottom: 1 }} // Reduced vertical spacing
          />

          {error && (
            <Typography color="error" variant="body2" align="center">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginTop: 1, alignSelf: 'center', width: '100%' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
