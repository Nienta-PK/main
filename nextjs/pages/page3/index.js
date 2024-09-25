import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import Grid from "@mui/material/Grid2";
import { Box, Typography, Button, TextField } from "@mui/material"; // Use by LoginForm
import useBearStore from "@/store/useBearStore";
import { useState, useEffect } from 'react';
import { createConnection } from '../../utils/chat';

function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return() => {
      connection.disconnect();
    };
  }, [roomId, serverUrl]);

  return (
    <>
      <label>
        Server URL:{' '}
        <input
            value={serverUrl}
            onChange={e => setServerUrl(e.target.value)}
        />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}

export default function App() {
    const [roomId, setRoomId] = useState('general');
    const [show, setShow] = useState(false);

    return (
        <Box
            textAlign="center"
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            width="100vw"
            bgcolor="background.default"  // Apply default background color from the theme
            flexDirection="column"  // Arrange content vertically
        >
            <label>
                Choose the chat room: {''}
                <select
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}    
                >
                    <option value="general">General</option>
                    <option value="travel">Travel</option>
                    <option value="music">Music</option>
                </select>
            </label>
            <button onClick={() => setShow(!show)}>
                {show ? 'Close chat' : 'Open chat'}
            </button>
            {show && <hr />}
            {show && <ChatRoom roomId={roomId} />}
        </Box>
    );
}
