import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

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
