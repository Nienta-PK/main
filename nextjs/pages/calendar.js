import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Modal, Box, Typography, Button } from '@mui/material';
import axios from 'axios';
import withAuth from '@/hoc/withAuth';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

function MyCalendar() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    // Fetch tasks from FastAPI backend
    const currentUserId = localStorage.getItem('user_id')
    axios.get(`http://localhost:8000/task-for-calendar?user_id=${currentUserId}`)
    .then(response => {
      const events = response.data.map(task => ({
        id: task.task_id,
        title: task.title,
        description: task.description,
        start: new Date(task.due_date),
        end: new Date(task.due_date),
      }));
      setCalendarEvents(events);
    })
    .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (date) => format(date, 'PP');
  const formatTime = (date) => format(date, 'p');

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Calendar</h1>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: '50px' }}
        onSelectEvent={handleEventClick}
      />

      <Modal open={modalOpen} onClose={handleModalClose} aria-labelledby="event-modal-title">
        <Box sx={modalStyle}>
          {selectedEvent && (
            <>
              <Typography id="event-modal-title" variant="h6" component="h2">
                {selectedEvent.title}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>Description:</strong> {selectedEvent.description}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>Due Date:</strong> {formatDate(selectedEvent.start)}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>Due Time:</strong> {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
              </Typography>
              <Button onClick={handleModalClose} sx={{ mt: 2 }}>
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

// Basic styling
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    color: '#333',
  },
};

// Modal styling
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default withAuth(MyCalendar);