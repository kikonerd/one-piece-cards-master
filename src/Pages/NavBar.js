// NavBar.js
import React, { useState } from 'react';
import '../Styles/NavBar.css'; // Certifique-se de que o arquivo CSS esteja atualizado

function NavBar({ setShowUserCardList, setShowFriendsList, setShowFriendDeck, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (page) => {
    setMenuOpen(false); // Fecha o menu ao navegar
    setShowUserCardList(page === 'userCardList'); // Define se deve mostrar o a lista de cartas do user
    setShowFriendsList(page === 'friendsList'); // Define se deve mostrar a lista de amigos do user
    setShowFriendDeck(false);
  };

  return (
    <nav className="navbar">
      <button onClick={toggleMenu} className="menu-button">MENU</button>
      {menuOpen && (
        <div className="dropdown-menu">
          <button onClick={() => handleNavigation('cardList')}>Lista de Cartas</button>
          <button onClick={() => handleNavigation('userCardList')}>O meu Deck</button>
          <button onClick={() => handleNavigation('friendsList')}>Amigos</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
