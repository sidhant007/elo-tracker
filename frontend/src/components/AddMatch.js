// src/components/AddMatch.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container, Select, MenuItem, InputLabel, FormControl, TextField } from '@mui/material';
import './Error.css';

function AddMatch() {
  const apiBaseUrl = process.env.REACT_APP_BASE_URL || '';
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const { roomName } = useParams();
  const [matchType, setMatchType] = useState('doubles');
  const [winnerName, setWinnerName] = useState('');
  const [loserName, setLoserName] = useState('');
  const [winningTeam, setWinningTeam] = useState(['', '']);
  const [losingTeam, setLosingTeam] = useState(['', '']);
  const [gamePoints, setGamePoints] = useState("11");  // First box for 11 or 21
  const [losingPoints, setLosingPoints] = useState('');  // Second box for custom number
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${apiBaseUrl}/api/rooms/${roomName}/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setErrorMessage('');
        setShowError(false);
        const usernames = response.data.leaderboard.map(player => player.username);
        setPlayers(usernames);
      } catch (error) {
        const message = error.response?.data?.msg || 'An error occurred!';
        setErrorMessage(message);
        setShowError(true);
      }
    };
    fetchPlayers();
  }, [roomName]);

  const handleAddMatch = async () => {
    const token = localStorage.getItem('token');
    const score = losingPoints === '' ? null : `${gamePoints}-${losingPoints}`
    if (matchType === 'singles') {
      try {
        await axios.post('${apiBaseUrl}/api/matches/add', { 
          type: 'singles', room_name: roomName, winner_name: winnerName, loser_name: loserName, score: score
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate(`/room/${roomName}`);
      } catch (error) {
        const message = error.response?.data?.msg || 'An error occurred!';
        setErrorMessage(message);
        setShowError(true);
      }
    } else {
      try {
        await axios.post('${apiBaseUrl}/api/matches/add', { 
          type: 'doubles', room_name: roomName, winning_team: winningTeam, losing_team: losingTeam, score: score
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate(`/room/${roomName}`);
      } catch (error) {
        const message = error.response?.data?.msg || 'An error occurred!';
        setErrorMessage(message);
        setShowError(true);
      }
    }
  };

  return (
    <Container>
      <h2>Add Match</h2>
      <Select value={matchType} onChange={(e) => setMatchType(e.target.value)} fullWidth>
        <MenuItem value="doubles">Doubles</MenuItem>
        <MenuItem value="singles">Singles</MenuItem>
      </Select>

      {/* Singles Match Type */}
      {matchType === 'singles' && (
        <>
          {/* Winner Select (Green) */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Winner</InputLabel>
            <Select
              value={winnerName}
              onChange={(e) => setWinnerName(e.target.value)}
              fullWidth
              style={{ backgroundColor: 'lightgreen' }} 
            >
              <MenuItem value="" disabled>Winner</MenuItem> {/* Placeholder */}
              {players.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Loser Select (Red) */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Loser</InputLabel>
            <Select
              value={loserName}
              onChange={(e) => setLoserName(e.target.value)}
              fullWidth
              style={{ backgroundColor: 'lightcoral' }}
            >
              <MenuItem value="" disabled>Loser</MenuItem> {/* Placeholder */}
              {players.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      {/* Doubles Match Type */}
      {matchType === 'doubles' && (
        <>
          {/* Winning Team Player 1 Select */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Winning Team Player 1</InputLabel>
            <Select
              value={winningTeam[0]}
              onChange={(e) => setWinningTeam([e.target.value, winningTeam[1]])}
              fullWidth
              style={{ backgroundColor: 'lightgreen' }}
            >
              <MenuItem value="" disabled>Winner</MenuItem> {/* Placeholder */}
              {players.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Winning Team Player 2 Select */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Winning Team Player 2</InputLabel>
            <Select
              value={winningTeam[1]}
              onChange={(e) => setWinningTeam([winningTeam[0], e.target.value])}
              fullWidth
              style={{ backgroundColor: 'lightgreen' }}
            >
              <MenuItem value="" disabled>Winner</MenuItem> {/* Placeholder */}
              {players.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Losing Team Player 1 Select */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Losing Team Player 1</InputLabel>
            <Select
              value={losingTeam[0]}
              onChange={(e) => setLosingTeam([e.target.value, losingTeam[1]])}
              fullWidth
              style={{ backgroundColor: 'lightcoral' }}
            >
              <MenuItem value="" disabled>Loser</MenuItem> {/* Placeholder */}
              {players.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Losing Team Player 2 Select */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Losing Team Player 2</InputLabel>
            <Select
              value={losingTeam[1]}
              onChange={(e) => setLosingTeam([losingTeam[0], e.target.value])}
              fullWidth
              style={{ backgroundColor: 'lightcoral' }}
            >
              <MenuItem value="" disabled>Loser</MenuItem> {/* Placeholder */}
              {players.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      {/* First box: Game Points (11 or 21) */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Game Points</InputLabel>
        <Select
          value={gamePoints}
          onChange={(e) => setGamePoints(e.target.value)}
          fullWidth
        >
          <MenuItem value={"11"}>11</MenuItem>
          <MenuItem value={"21"}>21</MenuItem>
        </Select>
      </FormControl>

      {/* Second box: Custom number */}
      <FormControl fullWidth margin="normal">
        <TextField
          label="Losing Points"
          type="number"
          value={losingPoints}
          onChange={(e) => setLosingPoints(e.target.value)}
          fullWidth
        />
      </FormControl>

      {/* Add Match Button */}
      <Button variant="contained" onClick={handleAddMatch} fullWidth>Add Match</Button>

      {/* Back Button */}
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

export default AddMatch;
