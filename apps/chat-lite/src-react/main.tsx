/**
 * React 应用入口
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OpenClawProvider } from './components/OpenClawProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OpenClawProvider>
      <App />
    </OpenClawProvider>
  </React.StrictMode>
);
