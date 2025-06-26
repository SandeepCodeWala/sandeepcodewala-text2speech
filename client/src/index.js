import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ReactGA from 'react-ga4';


const root = ReactDOM.createRoot(document.getElementById('root'));
const GA4_MEASUREMENT_ID = process.env.REACT_APP_GA4_MEASUREMENT_ID || 'G-X4JQVB1HH9';
const GA4_MEASUREMENT_ID_2 = 'G-TR2DSMXQFV';

// Initialize Google Analytics 4
ReactGA.initialize(GA4_MEASUREMENT_ID);
ReactGA.initialize(GA4_MEASUREMENT_ID_2);

// Optional: Send initial pageview for the root path
// This is important for Single Page Applications (SPAs)
ReactGA.send({ hitType: 'pageview', page: window.location.pathname });

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
