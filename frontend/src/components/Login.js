// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container } from '@mui/material';
import './Error.css';

function Login() {
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      navigate('/rooms');
    } catch (error) {
      const message = error.response?.data?.msg|| 'An error occurred!';
      setErrorMessage(message);
      setShowError(true);
    }
  };

  return (
    <Container>
      <h2>ELO Tracker (for racket sports)</h2>
      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <br />
      <Button variant="contained" onClick={handleLogin}>Login</Button>
      <Button variant="outlined" onClick={() => navigate('/register')}>Register</Button>
      <footer style={{ textAlign: 'center', padding: '20px', marginTop: '20px', fontSize: '14px' }}>
      Made with <span role="img" aria-label="heart">❤️</span> at <i>TT ke Nashe</i>
      </footer>
      {/* Conditionally render the error popup */}
      {showError && (
        <div className="error-popup">
          {errorMessage}
        </div>
      )}
    </Container>
  );
}

export default Login;

