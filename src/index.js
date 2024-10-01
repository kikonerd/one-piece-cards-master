import React from 'react';
import ReactDOM from 'react-dom/client';
import MainRouter from './MainRouter'; // Verifique se está importando corretamente
import './Styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MainRouter /> {/* Mantenha o Router aqui */}
  </React.StrictMode>
);