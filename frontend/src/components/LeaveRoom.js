// src/components/LeaveRoom.js
import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Container } from '@mui/material';
import './Error.css';

function LeaveRoom() {
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const { roomName } = useParams();
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLeaveRoom = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/rooms/leave', { room_name: roomName, personal_password: password }, {
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
      <h2>Leave {roomName}</h2>
      NOTE: All your progress in this room will be lost.

      Please type in your personal password to confirm leaving the room.
      <TextField 
        label="Personal Password" 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        fullWidth 
        margin="normal"
      />
      <Button variant="contained" onClick={handleLeaveRoom} fullWidth>Leave Room</Button>
      <Button variant="outlined" onClick={() => navigate(`/room/${roomName}`)} fullWidth>Back to {roomName}</Button>
      {/* Conditionally render the error popup */}
      {showError && (
        <div className="error-popup">
          {errorMessage}
        </div>
      )}
    </Container>
  );
}

export default LeaveRoom;
