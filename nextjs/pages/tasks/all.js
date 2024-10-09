import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';

export default function AllTasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'work', 'personal', 'urgent', 'other'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'ongoing', 'delay', 'abandoned'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'urgent', 'high', 'low'
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [filterType, filterStatus, filterPriority, tasks]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/tasks'); // Replace with your actual backend API
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by task type
    if (filterType !== 'all') {
      filtered = filtered.filter((task) => task.task_type === filterType);
    }

    // Filter by task status (completed, ongoing, delay, or abandoned)
    if (filterStatus === 'completed') {
      filtered = filtered.filter((task) => task.is_completed === true);
    } else if (filterStatus === 'ongoing') {
      filtered = filtered.filter((task) => !task.is_completed && !task.is_abandoned && new Date(task.due_date) >= new Date());
    } else if (filterStatus === 'delay') {
      filtered = filtered.filter((task) => !task.is_completed && !task.is_abandoned && new Date(task.due_date) < new Date());
    } else if (filterStatus === 'abandoned') {
      filtered = filtered.filter((task) => task.is_abandoned === true);
    }

    // Filter by task priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    setFilteredTasks(filtered);
  };

  const getTaskStatus = (task) => {
    if (task.is_abandoned) {
      return 'Abandoned';
    } else if (task.is_completed) {
      return 'Completed';
    } else if (new Date(task.due_date) < new Date()) {
      return 'Delay'; // Task is overdue
    } else {
      return 'Ongoing'; // Task is still ongoing and not yet completed
    }
  };

  const handleTaskClick = (taskId) => {
    router.push(`/tasks/${taskId}`); // Redirect to the individual task details page
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setFilterPriority('all');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>All Tasks</h1>

      {/* Filters */}
      <div style={styles.filters}>
        {/* Task Type Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="urgent">Project</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Task Status Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
            <option value="delay">Delay</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>

        {/* Task Priority Filter */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>Filter by Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div style={styles.clearFilterContainer}>
        <button onClick={handleClearFilters} style={styles.clearFilterButton}>
          Clear Filters
        </button>
      </div>

      {loading && <CircularProgress />}

      {error && <p style={styles.errorText}>Error: {error}</p>}

      {!loading && filteredTasks.length === 0 && <p>No tasks found.</p>}

      {!loading && filteredTasks.length > 0 && (
        <ul style={styles.taskList}>
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              style={styles.taskItem}
              onClick={() => handleTaskClick(task.id)}
            >
              <div style={styles.taskDetails}>
                <h3 style={styles.taskTitle}>{task.title}</h3>
                <p style={styles.taskType}>Type: {task.task_type}</p>
                <p style={styles.taskStatus}>
                  Status: {getTaskStatus(task)}
                </p>
                <p style={styles.taskPriority}>Priority: {task.priority}</p>
                <p style={styles.dueDate}>Due: {task.due_date} {task.due_time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
  },
  filters: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  select: {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  clearFilterContainer: {
    marginTop: '20px',
  },
  clearFilterButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  taskList: {
    listStyleType: 'none',
    padding: '0',
  },
  taskItem: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  taskDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  taskType: {
    fontSize: '1rem',
    color: '#555',
  },
  taskStatus: {
    fontSize: '1rem',
    color: '#0070f3',
  },
  taskPriority: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: '1rem',
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
};
