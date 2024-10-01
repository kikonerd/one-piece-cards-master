// src/MainRouter.js
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import App from './Pages/App'; // Ajuste o caminho conforme necessário

function MainRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Página inicial com login e dashboard /}
        <Route path="/deck/:friendId" element={<Deck />} /> {/ Rota para visualizar o deck do amigo */}
      </Routes>
    </Router>
  );
}

export default MainRouter;