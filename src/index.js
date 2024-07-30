// index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the createRoot method
import App from './App';
import './index.css'; // Import your CSS (if any)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
