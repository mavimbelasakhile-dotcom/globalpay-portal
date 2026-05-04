import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Enforce SSL — redirect any HTTP traffic to HTTPS outside of local dev
if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
  window.location.replace(
    `https://${window.location.host}${window.location.pathname}${window.location.search}`
  );
} else {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  reportWebVitals();
}
