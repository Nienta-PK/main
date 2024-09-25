import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import Grid from "@mui/material/Grid2";
import { Box, Typography, Button, TextField } from "@mui/material"; // Use by LoginForm
import useBearStore from "@/store/useBearStore";
import { Bloodtype } from "@mui/icons-material";
import { useState } from "react";

function Home() {
  const [InputText,setInputText] = useState('');
  const [displayText,setDisplayText] = useState('');
  const handleInputChange = (event)=>{
    setInputText(event.target.value)
  }
  const handleClick=()=>{
    setDisplayText(InputText)
  }

  return (
<Box textAlign="center" p={4} sx={{border: 1}}minHeight="100vh"
    bgcolor="background.default">
  <Typography variant="h4" gutterBottom>
    Page3
  </Typography>
  <Grid container spacing={0.5}>
    <Grid size={{xs:6, md:4}}>
      <Button variant="contained" color="primary" href="/page1">
        Go to page1
      </Button>
    </Grid>
  <Grid size={{xs:6, md:4}}>
    <Button variant="contained" color="primary" href="/page2">
      Go to page2
    </Button>
  </Grid>
  <Grid size={{xs:6, md:4}}>
    <Button variant="contained" color="primary" href="/page3">
      Go to page3
    </Button>
  </Grid>
  <Grid size={{xs:6, md:4}}>
  </Grid>
  </Grid>
  <Grid size={{xs:12, md:12}}>
    <TextField 
    id="filled-basic" label="Search" variant="filled" 
    InputProps={{style: { color: "#ffffff" }}} 
    InputLabelProps={{style: { color: "#ffffff" } }}
    value={InputText}
    onChange={handleInputChange}/>
  </Grid>
  <Grid size={{xs:12, md:12}}>
    <Button variant="contained" color="primary" onClick={handleClick}>
      Click
    </Button>
  </Grid>
  {/*Display The Text Below*/}
  {displayText && (
    <Grid item xs={12} md={12}>
      <Typography variant="h6" gutterBottom>
        You Type: {displayText}
      </Typography>
    </Grid>
  )}
</Box>
  );
}

export default Home;