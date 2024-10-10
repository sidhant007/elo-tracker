// src/components/RoomDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container, ToggleButtonGroup, ToggleButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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

  const maskElo = (elo) => {
    const eloStr = Math.round(elo).toString();
    if (eloStr.length > 2) {
      return eloStr.slice(0, -2) + '??';
    }
    return '??';
  };

  const shuffleArray = (array) => {
    const shuffled = array.slice(); // Create a copy to shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell align="right">ELO</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.slice(0, Math.min(3, leaderboard.length)).map((player) => (
              <TableRow key={player.username}>
                <TableCell style={{ color: 'green' }}>{player.username}</TableCell>
                <TableCell align="right">{Math.round(player.elo)}</TableCell>
              </TableRow>
            ))}
            {leaderboard.length > 3 && shuffleArray(leaderboard.slice(3)).map((player) => (
              <TableRow key={player.username}>
                <TableCell>{player.username}</TableCell>
                <TableCell align="right">{maskElo(player.elo)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <br />
      Note: Only the top 3 players are shown. The rank and ELO of other players are hidden. It will be revealed on season end.
      <br />

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
