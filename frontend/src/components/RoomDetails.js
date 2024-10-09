// src/components/RoomDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container, ToggleButtonGroup, ToggleButton } from '@mui/material';
import './Error.css';

function RoomDetails() {
  const apiBaseUrl = process.env.REACT_APP_BASE_URL || '';
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const { roomName } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [matchType, setMatchType] = useState('doubles');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${apiBaseUrl}/api/rooms/${roomName}/leaderboard?type=${matchType}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setErrorMessage('');
        setShowError(false);
        setLeaderboard(response.data.leaderboard);
      } catch (error) {
        const message = error.response?.data?.msg || 'An error occurred!';
        setErrorMessage(message);
        setShowError(true);
      }
    };

    fetchLeaderboard();
  }, [roomName, matchType]);

  const handleAddMatch = () => {
    navigate(`/room/${roomName}/add-match`);
  };

  const handleHistory = () => {
    navigate(`/room/${roomName}/all-matches`);
  };

  const handleLeaveRoom = () => {
    navigate(`/leave-room/${roomName}`);
  };

  const handleMatchTypeChange = (e, newType) => {
    // Prevent setting the state to null when clicked twice
    if (newType !== null) {
      setMatchType(newType);
    }
  };

  return (
    <Container>
      <h2>{roomName} Leaderboard</h2>
      <ToggleButtonGroup
        value={matchType}
        exclusive
        onChange={handleMatchTypeChange}
      >
        <ToggleButton value="doubles">Doubles</ToggleButton>
        <ToggleButton value="singles">Singles</ToggleButton>
      </ToggleButtonGroup>

      <ul>
        {leaderboard.map((player) => (
          <li key={player.username}>{player.username}: {Math.round(player.elo)}</li>
        ))}
      </ul>

      <Button variant="contained" onClick={handleAddMatch}>Add Match</Button>
      <Button variant="contained" onClick={handleHistory}>History</Button>
      <Button variant="contained" onClick={handleLeaveRoom}>Leave Room</Button>
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

export default RoomDetails;
