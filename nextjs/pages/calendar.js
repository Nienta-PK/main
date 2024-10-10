import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Modal, Box, Typography, Button } from '@mui/material';

// Localizer to use date-fns for calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // week starts on Sunday
  getDay,
  locales,
});

// Sample events data with description, start date/time, and end date/time
const events = [
  {
    id: 0,
    title: 'Team Meeting',
    start: new Date(2024, 9, 11, 10, 0), // October 11, 2024 at 10:00 AM
    end: new Date(2024, 9, 11, 11, 30),  // October 11, 2024 at 11:30 AM
    description: 'Discuss project updates and deadlines.',
  },
  {
    id: 1,
    title: 'Project Deadline',
    start: new Date(2024, 9, 14, 8, 0),  // October 14, 2024 at 8:00 AM
    end: new Date(2024, 9, 14, 23, 59),  // October 14, 2024 at 11:59 PM
    description: 'Complete the final submission of the project.',
  },
  {
    id: 2,
    title: 'Workshop',
    start: new Date(2024, 9, 16, 12, 0), // October 16, 2024 at 12:00 PM
    end: new Date(2024, 9, 16, 15, 0),  // October 16, 2024 at 3:00 PM
    description: 'Attend the UI/UX workshop for skill improvement.',
  },
];

export default function MyCalendar() {
  const [calendarEvents] = useState(events);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventClick = (event) => {
    setSelectedEvent(event); // Set the clicked event
    setModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setModalOpen(false); // Close the modal
    setSelectedEvent(null); // Clear the selected event
  };

  const formatDate = (date) => format(date, 'PP'); // Format date (e.g., Oct 11, 2024)
  const formatTime = (date) => format(date, 'p');  // Format time (e.g., 10:00 AM)

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Calendar</h1>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: '50px' }}
        onSelectEvent={handleEventClick} // Event handler for clicking an event
      />

      {/* Modal for Event Details */}
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