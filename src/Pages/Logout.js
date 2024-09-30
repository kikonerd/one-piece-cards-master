// Logout.js
import React from 'react';
import { auth } from '../firebase'; // Certifique-se de ter o caminho correto
import { signOut } from 'firebase/auth';

function Logout() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Adicione aqui qualquer lógica adicional que você queira após o logout, como redirecionar para a página de login
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
    }
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default Logout;
