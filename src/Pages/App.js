// App.js
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'; // Importa as funções do Firestore
import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { auth, db } from '../firebase';
import CardList from './CardList';
import Dashboard from './Dashboard';
import Deck from './Deck';
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
        const fetchUserDetails = async () => {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setNickname(userDoc.data().nickname);
            setShowDashboard(false);
          } else {
            let nicknameInput = prompt("Insira seu nickname:");
            if (nicknameInput && nicknameInput.trim().length >= 3) {
              const q = query(collection(db, "users"), where("nickname", "==", nicknameInput));
              const nicknameSnapshot = await getDocs(q);
              if (nicknameSnapshot.empty) {
                await setDoc(doc(db, "users", user.uid), {
                  email: user.email,
                  nickname: nicknameInput,
                });
                setNickname(nicknameInput);
                setShowDashboard(true);
              } else {
                alert("Este nickname já está em uso. Por favor, escolha outro.");
                await auth.signOut();
                setUser(null);
                setNickname('');
                setShowDashboard(false);
              }
            } else {
              alert("O nickname deve ter pelo menos 3 caracteres e não pode ser vazio.");
              await auth.signOut();
              setUser(null);
              setNickname('');
              setShowDashboard(false);
            }
          }
        };
        fetchUserDetails();
      } else {
        setNickname('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut(); // Faz o logout do usuário
    setShowDashboard(false); // Reseta o estado para mostrar a página de login
    setShowFriendsList(false); // Reseta o estado para mostrar a página de login
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  return (
    <div className="App">
      {!user ? (
        <LandingPage onLogin={handleGoogleLogin} />
      ) : (
        <>
          <NavBar 
            setShowDashboard={setShowDashboard} 
            setShowFriendsList={setShowFriendsList} 
            onLogout={handleLogout} 
          />
          <div className="welcome-message">
            Bem-vindo, {nickname}
          </div>
          <Routes>
            <Route path="/deck/:friendId" element={<Deck />} />
            <Route path="/" element={showFriendsList ? <FriendsList userId={user.uid} /> : showDashboard ? <Dashboard userId={user.uid} /> : <CardList />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
