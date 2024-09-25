import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useRouter } from 'next/router'; // Import useRouter
import NavigationLayout from './NavigationBar';
import FooterLayout from './Footer';

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
  const router = useRouter(); // Get the current route

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Pages where you want to hide navigation or footer
  const noNavPages = ['/','/login', '/register']; // Add paths where you don't want the navigation bar
  const noFooterPages = ['/login', '/register']; // Add paths where you don't want the footer

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div>
        {/* Conditionally render NavigationBar */}
        {!noNavPages.includes(router.pathname) && (
          <NavigationLayout toggleTheme={toggleTheme} darkMode={darkMode} />
        )}
        <main>{children}</main>
        {/* Conditionally render Footer */}
        {!noFooterPages.includes(router.pathname) && (
          <FooterLayout darkMode={darkMode} />
        )}
      </div>
    </ThemeProvider>
  );
}