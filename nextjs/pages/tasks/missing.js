import { useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress } from '@mui/material';

export default function NewTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [taskType, setTaskType] = useState('work');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Use Next.js router for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (title.trim() === '') {
      setError('Task title is required.');
      setLoading(false);
      return;
    }

    const taskData = {
      title,
      description,
      task_type: taskType, // Include task type in the data
      is_completed: false,
      is_important: isImportant,
    };

    try {
      const res = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      // Navigate back to task list after task creation
      router.push('/tasks/all'); // Redirect to All Tasks page
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.sectionTitle}>Create New Task</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Task Details</h2>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="title">
              Task Title *
            </label>
            <input
              style={styles.input}
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the task title"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="description">
              Task Description
            </label>
            <textarea
              style={styles.textarea}
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description of the task (optional)"
            />
          </div>

          {/* Task Type Field */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="taskType">
              Task Type *
            </label>
            <select
              style={styles.select}
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              required
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="urgent">Urgent</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div style={styles.formGroupCheckbox}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isImportant}
              onChange={() => setIsImportant(!isImportant)}
            />
            Mark as Important
          </label>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Task'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '2rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    marginBottom: '20px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  },
  formGroup: {
    textAlign: 'left',
    marginBottom: '15px',
  },
  formGroupCheckbox: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
  },
  textarea: {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
    minHeight: '80px',
  },
  select: {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
};
