import React from 'react';
import { useTheme } from '@emotion/react';

const FooterLayout = ({ darkMode }) => {
  const theme = useTheme();
  const footerBgColor = theme.palette.background.paper; // Use the same background color as the AppBar

  return (
    <footer style={{ textAlign: 'center', padding: '20px', backgroundColor: footerBgColor }}>
      <p style={{ color: darkMode ? '#ffffff' : '#000000' }}>
        &copy; {new Date().getFullYear()} Your Website. All Rights Reserved.
      </p>
    </footer>
  );
};

export default FooterLayout;  