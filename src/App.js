import React from 'react';
import { HashRouter, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Dashboard" element={< Dashboard/>}/> 
      </Routes>
    </HashRouter>
  );
}

export default App;
