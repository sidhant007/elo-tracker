// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container } from '@mui/material';
import './Error.css';

function Register() {
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('/api/auth/register', { username, password });
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.msg|| 'An error occurred!';
      setErrorMessage(message);
      setShowError(true);
    }
  };

  return (
    <Container>
      <h2>Register</h2>
      <TextField 
        label="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        fullWidth 
        margin="normal"
      />
      <TextField 
        label="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
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
      <Button variant="contained" onClick={handleRegister} fullWidth>Register</Button>
      <Button variant="outlined" onClick={() => navigate('/')} fullWidth>Back to Login</Button>
      {/* Conditionally render the error popup */}
      {showError && (
        <div className="error-popup">
          {errorMessage}
        </div>
      )}
    </Container>
  );
}

export default Register;
