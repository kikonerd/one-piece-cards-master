// App.js
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import CardList from './CardList';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import NavBar from './NavBar';


function App() {
  const [user, setUser] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut(); // Faz o logout do usuário
    setShowDashboard(false); // Reseta o estado para mostrar a página de login
  };

  const handleAddCards = () => {
    console.log("Função para adicionar cartas chamada.");
    // Aqui você pode adicionar a lógica para abrir um modal ou redirecionar para a página de adicionar cartas
  };

  const handleMenuClick = () => {
    console.log("Função de menu chamada.");
    // Aqui você pode adicionar a lógica para abrir um menu suspenso ou redirecionar
  };

  return (
    <div className="App">
      {user ? (
        <>
          <NavBar setShowDashboard={setShowDashboard} onLogout={handleLogout} />
      
          {showDashboard ? <Dashboard /> : <CardList />}
        </>
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default App;
