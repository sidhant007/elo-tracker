// src/components/Rooms.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, List, ListItem, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Error.css';

function Rooms() {
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [myRooms, setMyRooms] = useState([]);
  const [otherRooms, setOtherRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('/api/rooms/list', { headers: { Authorization: `Bearer ${token}` } });
        setErrorMessage('');
        setShowError(false);
        setMyRooms(response.data.myRooms);
        setOtherRooms(response.data.otherRooms);
      } catch (error) {
        const message = error.response?.data?.msg || 'An error occurred!';
        setErrorMessage(message);
        setShowError(true);
      }
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleRoomDetails = (roomName) => {
    navigate(`/room/${roomName}`);
  };

  const handleJoinRoom = (roomName) => {
    navigate(`/join-room/${roomName}`);
  };

  return (
    <Container>
      <h2>My Rooms</h2>
      <List>
        {myRooms.map((room) => (
          <ListItem key={room._id} button onClick={() => handleRoomDetails(room.name)}>
            {room.name} (owner: {room.owner})
          </ListItem>
        ))}
      </List>

      <h2>Other Rooms</h2>
      <List>
        {otherRooms.map((room) => (
          <ListItem key={room._id} button onClick={() => handleJoinRoom(room.name)}>
            {room.name} (owner: {room.owner})
          </ListItem>
        ))}
      </List>
      <Button variant="contained" onClick={handleCreateRoom}>Create Room</Button>
      {/* Conditionally render the error popup */}
      {showError && (
        <div className="error-popup">
          {errorMessage}
        </div>
      )}
    </Container>
  );
}

export default Rooms;
