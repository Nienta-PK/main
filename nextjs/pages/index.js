import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

// Array of image file names from the public/images folder
const imageList = [
  '/images/Bocchi.jpg',
  '/images/246890.jpg',
  '/images/a.jpg',
  '/images/anime-sunset.jpg',
];

export default function WelcomePage() {
  const [backgroundImage, setBackgroundImage] = useState(imageList[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textColor, setTextColor] = useState('white');

  // Change background automatically or manually
  useEffect(() => {
    const interval = setInterval(() => {
      handleChangeBackground();
    }, 5000); // Change background every 5 seconds
    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    // Call function to analyze brightness after the image is changed
    calculateImageBrightness(backgroundImage);
  }, [backgroundImage]);

  // Function to handle background change
  const handleChangeBackground = () => {
    const nextIndex = (currentIndex + 1) % imageList.length;
    setBackgroundImage(imageList[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  // Function to calculate the brightness of the current image
  const calculateImageBrightness = (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let r, g, b, avg;
      let colorSum = 0;

      for (let x = 0, len = pixels.length; x < len; x += 4) {
        r = pixels[x];
        g = pixels[x + 1];
        b = pixels[x + 2];

        avg = Math.floor((r + g + b) / 3);
        colorSum += avg;
      }

      const brightness = Math.floor(colorSum / (img.width * img.height));

      // If brightness is high, set dark text color; if brightness is low, set light text color
      setTextColor(brightness > 128 ? 'black' : 'white');
    };
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: textColor, // Set text color dynamically
        textAlign: 'center',
        transition: 'color 0.5s', // Smooth transition for text color change
      }}
    >
      <Typography variant="h3" sx={{ marginBottom: 2, fontWeight:'bold'}} className="textWithBorder">
        Welcome to the Dynamic Background Page
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <Button
          href="/login"
          variant="contained"
          color="primary"
          sx={{ textTransform: 'none' }}
        >
          Login
        </Button>

        <Button
          href="/register"
          variant="contained"
          color="secondary"
          sx={{ textTransform: 'none' }}
        >
          Register
        </Button>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleChangeBackground}
      >
        Change Background
      </Button>
    </Box>
  );
}