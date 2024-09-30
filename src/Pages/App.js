// App.js
import { doc, getDoc } from 'firebase/firestore'; // Importa as funções do Firestore
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import CardList from './CardList';
import Dashboard from './Dashboard';
import FriendsList from './FriendsList';
import LandingPage from './LandingPage';
import NavBar from './NavBar';

function App() {
  const [user, setUser] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
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
    setShowFriendsList(false); // Reseta o estado para mostrar a página de login
  };

  return (
    <div className="App">
      {user ? (
        <>
          <NavBar setShowDashboard={setShowDashboard} setShowFriendsList={setShowFriendsList} onLogout={handleLogout} />
          <div className="welcome-message" style={{marginLeft: '43px'}}>
            <p style={{color: 'white', WebkitTextStrokeColor: 'black', WebkitTextStrokeWidth: '1.2px', fontSize: '30px', marginBottom: '5px'}}>Bem-vindo, {nickname}</p>
          </div>
          {showFriendsList ? <FriendsList userId={user.uid} /> : showDashboard ? <Dashboard userId={user.uid} /> : <CardList />}
        </>
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default App;
