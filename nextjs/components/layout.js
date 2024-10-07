import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useRouter } from 'next/router';
import NavigationLayout from './NavigationBar';
import FooterLayout from './Footer';
import CustomCursor from './CustomCursor'; // Import the custom cursor

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#000000',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

export default function Layout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [customCursorEnabled, setCustomCursorEnabled] = useState(false); // Initially disabled
  const router = useRouter();

  // Load theme and cursor preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedCursorState = localStorage.getItem('customCursorEnabled');

    if (savedTheme === 'dark') {
      setDarkMode(true);
    }

    if (savedCursorState === 'true') {
      setCustomCursorEnabled(true);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const toggleCustomCursor = () => {
    const newCursorState = !customCursorEnabled;
    setCustomCursorEnabled(newCursorState);
    localStorage.setItem('customCursorEnabled', newCursorState ? 'true' : 'false');
  };

  // Apply/remove customCursorEnabled class to hide system cursor when needed
  useEffect(() => {
    if (customCursorEnabled) {
      document.body.classList.add('customCursorEnabled');
    } else {
      document.body.classList.remove('customCursorEnabled');
    }
  }, [customCursorEnabled]);

  const noNavPages = ['/', '/login', '/register'];
  const noFooterPages = ['/login', '/register'];

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div>
        {/* Conditionally render Custom Cursor based on the toggle state */}
        <CustomCursor useCustomCursor={customCursorEnabled} /> 

        {!noNavPages.includes(router.pathname) && (
          <NavigationLayout
            toggleTheme={toggleTheme}
            darkMode={darkMode}
            customCursorEnabled={customCursorEnabled}
            toggleCustomCursor={toggleCustomCursor} // Pass toggle function and state
          />
        )}
        <main>{children}</main>
        {!noFooterPages.includes(router.pathname) && (
          <FooterLayout darkMode={darkMode} />
        )}
      </div>
    </ThemeProvider>
  );
}
