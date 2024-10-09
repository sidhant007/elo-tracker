// src/components/JoinRoom.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Container, List, ListItem } from '@mui/material';
import './Error.css';

function JoinRoom() {
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const { roomName } = useParams();
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/rooms/join', { room_name: roomName, room_password: password }, {
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
      <h2>Join {roomName}</h2>
      <TextField 
        label="Password" 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        fullWidth 
        margin="normal"
      />
      <Button variant="contained" onClick={handleJoinRoom} fullWidth>Join Room</Button>
      <Button variant="outlined" onClick={() => navigate('/rooms')} fullWidth>Back to All Rooms</Button>
      {/* Conditionally render the error popup */}
      {showError && (
        <div className="error-popup">
          {errorMessage}
        </div>
      )}
    </Container>
  );
}

export default JoinRoom;
