import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { ThemeToggle } from './utils/themeToggle.js';
import './index.css';

// Inicializar sistema de tema após DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
  new ThemeToggle();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>,
);
