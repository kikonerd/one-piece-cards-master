// LandingPage.js
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Importe o Firebase
import { doc, setDoc } from 'firebase/firestore'; // Importe as funções do Firestore

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

      console.log("Usuário logado com sucesso!", user);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Bem-vindo, Capitão!</h1>
      <p>Crie um nickname para acessar suas cartas.</p>
      <input 
        type="text" 
        placeholder="Digite seu nickname" 
        value={nickname}
        onChange={(e) => setNickname(e.target.value)} // Atualiza o nickname
        style={{ margin: '10px', padding: '10px' }}
      />
      <button onClick={handleGoogleLogin} style={{ margin: '10px', padding: '10px' }}>
        Login com Google
      </button>
    </div>
  );
};

export default LandingPage;
