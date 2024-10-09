// src/components/AllMatches.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container } from '@mui/material';
import './Error.css';

function AllMatches() {
  const apiBaseUrl = process.env.BACKEND_API_URL;
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const { roomName } = useParams();
  const [allMatches, setAllMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllMatches = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${apiBaseUrl}/api/rooms/${roomName}/all_matches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setErrorMessage('');
        setShowError(false);
        setAllMatches(response.data.matches);
      } catch (error) {
        const message = error.response?.data?.msg || 'An error occurred!';
        setErrorMessage(message);
        setShowError(true);
      }
    };
    fetchAllMatches();
  }, [roomName]);

  return (
    <Container>
      <h2>{roomName} - History of all matches</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Winners</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Losers</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Date</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>ELO Delta</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Score</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Added By</th>
          </tr>
        </thead>
        <tbody>
          {allMatches.map((match, index) => (
            <tr key={index}>
              {/* Winners in green */}
              <td style={{ color: 'green', fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>
                {match.winners.join(', ')}
              </td>

              {/* Losers in red */}
              <td style={{ color: 'red', fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>
                {match.losers.join(', ')}
              </td>

              {/* Date */}
              <td style={{ border: '1px solid black', padding: '8px' }}>
                {match.date}
              </td>

              {/* ELO Delta */}
              <td style={{ color: 'black', fontWeight: 'bold', border: '1px solid black', padding: '8px' }}>
                Δ{Math.round(match.delta)}
              </td>

              {/* Score */}
              <td style={{ border: '1px solid black', padding: '8px' }}>
                {match.score}
              </td>

              {/* Added By */}
              <td style={{ border: '1px solid black', padding: '8px' }}>
                {match.addedBy}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default AllMatches;
