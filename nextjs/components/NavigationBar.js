import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import FunctionsIcon from '@mui/icons-material/Functions';
import PersonIcon from '@mui/icons-material/Person';
import Brightness4Icon from '@mui/icons-material/Brightness4';  // Moon Icon for Dark Mode
import Brightness7Icon from '@mui/icons-material/Brightness7';  // Sun Icon for Light Mode
import useBearStore from '@/store/useBearStore';

const NavigationLayout = ({ darkMode, toggleTheme, customCursorEnabled, toggleCustomCursor }) => {
  const router = useRouter();
  const appName = useBearStore((state) => state.appName);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Link href={'/'}>
            <FunctionsIcon sx={{ color: '#ffffff' }} fontSize="large" />
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
            TTM {darkMode ? '(Dark Mode)' : '(Light Mode)'}
          </Typography>
          <NavigationLink href="/login" label="Login" />
          <NavigationLink href="/page2" label="Page2" />
          <NavigationLink href="/Nah" label="Page3" />
          <NavigationLink href="/page3" label="Chat" />
          <div style={{ flexGrow: 1 }} />
          
          {/* Search Field */}
          <TextField
            id="filled-basic"
            label="Search"
            variant="filled"
            InputProps={{ style: { color: '#ffffff' } }}
            InputLabelProps={{ style: { color: '#ffffff' } }}
          />

          {/* Account Icon */}
          <Button
            color="inherit"
            onClick={() => {
              router.push('/account');
            }}
          >
            <PersonIcon />
          </Button>

          {/* Toggle Theme Icon */}
          <IconButton onClick={toggleTheme} sx={{ ml: 1 }}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* Toggle Custom Cursor Button */}
          <Button
            onClick={toggleCustomCursor}
            color={customCursorEnabled ? 'success' : 'error'} // Change color based on custom cursor state
            variant="contained"
            sx={{ ml: 2 }}
          >
            {customCursorEnabled ? 'Disable Custom Cursor' : 'Enable Custom Cursor'}
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
};

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

export default NavigationLayout;
