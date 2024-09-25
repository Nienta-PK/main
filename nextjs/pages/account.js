import React from 'react'
import { Typography,Box } from '@mui/material'
import { useTheme } from '@emotion/react'

export default function Account() {
  const theme =useTheme()
  return (
    <Box 
    textAlign="center" 
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="background.default">
    <div>
        <Typography>
          This is Account Page
        </Typography>
    </div>
    </Box>
  )
}
