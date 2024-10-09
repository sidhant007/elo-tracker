// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Rooms from './components/Rooms';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import LeaveRoom from './components/LeaveRoom';
import RoomDetails from './components/RoomDetails';
import AllMatches from './components/AllMatches';
import AddMatch from './components/AddMatch';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for login page */}
        <Route path="/" element={<Login />} />

        {/* Route for register page */}
        <Route path="/register" element={<Register />} />

        {/* Route for rooms list (once the user is logged in) */}
        <Route path="/rooms" element={<Rooms />} />

        {/* Route for creating a new room */}
        <Route path="/create-room" element={<CreateRoom />} />

        {/* Route for joining an existing room */}
        <Route path="/join-room/:roomName" element={<JoinRoom />} />

        {/* Route for leaving an existing room */}
        <Route path="/leave-room/:roomName" element={<LeaveRoom />} />

        {/* Route for room details, using the room's name as a dynamic parameter */}
        <Route path="/room/:roomName" element={<RoomDetails />} />

        {/* Route for viewing history of all matches, using the room's name as a dynamic parameter */}
        <Route path="/room/:roomName/all-matches" element={<AllMatches />} />

        {/* Route for adding a match in a room, using the room's name as a dynamic parameter */}
        <Route path="/room/:roomName/add-match" element={<AddMatch />} />
      </Routes>
    </Router>
  );
}

export default App;

