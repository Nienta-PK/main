import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Fade,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PersonIcon from '@mui/icons-material/Person';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseIcon from '@mui/icons-material/Close';
import GridOnIcon from '@mui/icons-material/GridOn';
import { signOut } from 'next-auth/react';
import HistoryIcon from '@mui/icons-material/History';

const NavigationLink = ({ href, label }) => {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Typography
        variant="body1"
        sx={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#ffffff',
          padding: '0 10px',
        }}
      >
        {label}
      </Typography>
    </Link>
  );
};

const NavigationLayout = ({ darkMode, toggleTheme, customCursorEnabled, toggleCustomCursor }) => {
  const router = useRouter();

  // State to control the drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Check if the user is an admin
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('is_admin') === 'true';

  const handleNavigation = (path) => {
    setDrawerOpen(false);
    router.push(path); // Navigate to the selected path
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onKeyDown={toggleDrawer(false)}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
        }}
      >
        <Typography variant="h6">Settings</Typography>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      <List>
        <ListItem button onClick={() => handleNavigation('/account')}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="User Account" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/support')}>
          <ListItemIcon>
            <SupportAgentIcon />
          </ListItemIcon>
          <ListItemText primary="Contact Support" />
        </ListItem>
        <Divider />

        {/* Pages Accordion */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography>Pages</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem button onClick={() => handleNavigation('/dashboard')}>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/tasks/all')}>
                <ListItemText primary="All Task" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/tasks/create')}>
                <ListItemText primary="Create Task" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/calendar')}>
                <ListItemText primary="Calendar" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Accordion for Display Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Typography>Display Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography>Custom Cursor</Typography>
              <Switch checked={customCursorEnabled} onChange={toggleCustomCursor} color="primary" />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Typography>Dark Mode</Typography>
                <Fade in={true} timeout={600}>
                  <IconButton edge="end" color="inherit">
                    {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
                  </IconButton>
                </Fade>
              </Box>
              <Switch checked={darkMode} onChange={toggleTheme} color="primary" />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Conditionally render Users Management link if the user is an admin */}
        {isAdmin && (
          <>
            <Divider />
            <ListItem button onClick={() => handleNavigation('/all_user_data')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Users Management" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/login-history')}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary="Login History" />
            </ListItem>
          </>
        )}

        <ListItem
          button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('is_admin');
            localStorage.removeItem('email');
            signOut({ callbackUrl: '/login' });
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {/* App Icon */}
          <Link href="/home">
            <GridOnIcon sx={{ color: '#ffffff' }} fontSize="large" />
          </Link>

          {/* App Name */}
          <Typography
            variant="body1"
            sx={{
              fontSize: '22px',
              fontWeight: 500,
              color: '#ffffff',
              padding: '0 10px',
              fontFamily: 'Prompt',
            }}
          >
            My Task Management
          </Typography>

          {/* Navigation Links */}
          <NavigationLink href="/home" label="Home" />
          <NavigationLink href="/tasks/all" label="Tasks" />

          <div style={{ flexGrow: 1 }} />

          {/* Create Task Button on the Right */}
          <Button
            variant="contained"
            color="secondary"
            sx={{ marginLeft: '20px', backgroundColor: '#f50057' }}
            onClick={() => router.push('/tasks/create')}
          >
            Create Task
          </Button>

          {/* Settings Icon to open the drawer */}
          <IconButton color="inherit" onClick={toggleDrawer(true)} sx={{ marginLeft: '10px' }}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for Settings and Pages */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default NavigationLayout;
