// App.js
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import CardList from './CardList';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import NavBar from './NavBar';
import { db } from '../firebase'; // Importe o db
import { doc, getDoc } from 'firebase/firestore'; // Importa as funções do Firestore

function App() {
  const [user, setUser] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [nickname, setNickname] = useState(''); // Estado para armazenar o nickname

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        // Busca o nickname do Firestore quando o usuário faz login
        const fetchNickname = async () => {
          const userDoc = await getDoc(doc(db, "users", user.uid)); // Pega o ID do usuário logado
          if (userDoc.exists()) {
            setNickname(userDoc.data().nickname); // Armazena o nickname
          } else {
            console.log("Nenhum documento encontrado para esse usuário");
          }
        };
        fetchNickname();
      } else {
        setNickname(''); // Reseta o nickname se não houver usuário logado
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut(); // Faz o logout do usuário
    setShowDashboard(false); // Reseta o estado para mostrar a página de login
  };

  return (
    <div className="App">
      {user ? (
        <>
          <NavBar setShowDashboard={setShowDashboard} onLogout={handleLogout} />
          <div className="welcome-message">
            Bem-vindo, {nickname}
          </div>
          {showDashboard ? <Dashboard userId={user.uid} /> : <CardList />}
        </>
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default App;
