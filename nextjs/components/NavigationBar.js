import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
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
  Menu,
  MenuItem,  // Import Menu and MenuItem
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
import useBearStore from '@/store/useBearStore';
import { signOut } from 'next-auth/react';
import GridOnIcon from '@mui/icons-material/GridOn';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Import icon for dropdown

const NavigationLayout = ({ darkMode, toggleTheme, customCursorEnabled, toggleCustomCursor }) => {
  const router = useRouter();
  const appName = useBearStore((state) => state.appName);

  // State to control the drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // State to control the page navigation menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    setAnchorEl(null);
    router.push(path);  // Navigate to the selected path
  };

  // Function to toggle the drawer state
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Drawer content with header
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onKeyDown={toggleDrawer(false)}
    >
      {/* Header with Settings text and close button */}
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

      {/* List of menu items */}
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

        {/* Accordion to group theme and cursor toggles */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Display Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Toggle Custom Cursor Switch */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography>Custom Cursor</Typography>
              <Switch
                checked={customCursorEnabled}
                onChange={toggleCustomCursor}
                color="primary"
              />
            </Box>
            {/* Toggle Theme Switch */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {/* Box for Typography and Icon together */}
              <Box display="flex" alignItems="center">
                <Typography>Dark Mode</Typography>

                {/* Fade transition for changing icon */}
                <Fade in={true} timeout={600}>
                  <IconButton edge="end" color="inherit">
                    {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
                  </IconButton>
                </Fade>
              </Box>

              {/* Switch for toggling the theme */}
              <Switch
                checked={darkMode}
                onChange={toggleTheme}
                color="primary"
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        <ListItem
          button
          onClick={() => {
            localStorage.removeItem('token');  // Clear the token from localStorage
            signOut({ callbackUrl: '/login' });  // Sign out and redirect to login page
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
          <Link href={'/home'}>
            <GridOnIcon sx={{ color: '#ffffff' }} fontSize="large" />
          </Link>
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
            My Task Manager
          </Typography>

          <div style={{ flexGrow: 1 }} />

          {/* Page Navigation Drop-down Menu */}
          <Button
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
            endIcon={<ArrowDropDownIcon />}
            sx={{ color: 'white' }}
          >
            Pages
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleNavigation('/dashboard')}>Dashboard</MenuItem>
            <MenuItem onClick={() => handleNavigation('/all_task')}>Game History</MenuItem>
            <MenuItem onClick={() => handleNavigation('/important')}>Game History</MenuItem>
            <MenuItem onClick={() => handleNavigation('/calendar')}>Game History</MenuItem>
          </Menu>

          {/* Settings Icon to open side menu */}
          <IconButton
            color="inherit"
            onClick={toggleDrawer(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer component for side menu */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default NavigationLayout;

