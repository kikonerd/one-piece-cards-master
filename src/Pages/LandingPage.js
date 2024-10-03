// LandingPage.js
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importe as funções do Firestore
import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Importe o Firebase

const LandingPage = () => {
  const [nickname, setNickname] = useState('');

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Salvar o nickname no Firestore
      if (nickname) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          nickname: nickname,
        });
      }
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Bem-vindo, Capitão!</h1>
      <button onClick={handleGoogleLogin} style={{ margin: '10px', padding: '10px' }}>
        Login com Google
      </button>
    </div>
  );
};

export default LandingPage;
