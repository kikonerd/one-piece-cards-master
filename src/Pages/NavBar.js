// NavBar.js
import React, { useState } from 'react';
import '../Styles/NavBar.css'; // Certifique-se de que o arquivo CSS esteja atualizado

function NavBar({ setShowDashboard, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (page) => {
    setMenuOpen(false); // Fecha o menu ao navegar
    setShowDashboard(page === 'dashboard'); // Define se deve mostrar o Dashboard
  };

  return (
    <nav className="navbar">
      <button onClick={toggleMenu} className="menu-button">MENU</button>
      {menuOpen && (
        <div className="dropdown-menu">
          <button onClick={() => handleNavigation('cardList')}>Lista de Cartas</button>
          <button onClick={() => handleNavigation('dashboard')}>Dashboard</button>
          <button onClick={() => handleNavigation('friends')}>Amigos</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
