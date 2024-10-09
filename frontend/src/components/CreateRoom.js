// src/components/CreateRoom.js
import React, { useState } from 'react';
import axios from 'axios';
import {  useNavigate } from 'react-router-dom';
import { TextField, Button, Container } from '@mui/material';
import './Error.css';

function CreateRoom() {
  const apiBaseUrl = process.env.BACKEND_API_URL;
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${apiBaseUrl}/api/rooms/create`, { room_name: roomName, room_password: password }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/rooms');
    } catch (error) {
      const message = error.response?.data?.msg || 'An error occurred!';
      setErrorMessage(message);
      setShowError(true);
    }
  };

  return (
    <Container>
      <h2>Create Room</h2>
      <TextField 
        label="Room Name" 
        value={roomName} 
        onChange={(e) => setRoomName(e.target.value)} 
        fullWidth 
        margin="normal"
      />
      <TextField 
        label="Password" 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        fullWidth 
        margin="normal"
      />
      <Button variant="contained" onClick={handleCreateRoom} fullWidth>Create Room</Button>
      <Button variant="outlined" onClick={() => navigate('/rooms')} fullWidth>Back to Rooms</Button>
      {/* Conditionally render the error popup */}
      {showError && (
        <div className="error-popup">
          {errorMessage}
        </div>
      )}
    </Container>
  );
}

export default CreateRoom;
