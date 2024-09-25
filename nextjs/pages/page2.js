import {React, useState} from "react";
import { Box, Typography, Button } from "@mui/material";

export default function Page1() {
    const [count,setCount]=useState(0);
    function handlebutton(){
        console.log("Test Button");
        setCount(count+1);
    }
    function decreaseBut(){
        console.log("Test Button");
        setCount(count-1);
    }

return (
<Box textAlign="center" p={4} bgcolor="background.default" minHeight="100vh">
<Button onClick={handlebutton} variant="contained">You click me {count}</Button>
</Box>
);
}

