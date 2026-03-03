import React from 'react';
import ReactDOM from 'react-dom/client';
// @ts-ignore - App component
import App from './components/App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
