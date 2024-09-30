import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react';
import { auth } from '../firebase';

const LandingPage = () => {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirecionar ou atualizar o estado após login
      console.log("Usuário logado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Bem-vindo, Capitão!</h1>
      <p>Cria uma conta ou faz login para acessar as tuas cartas.</p>
      <button onClick={handleGoogleLogin} style={{ margin: '10px', padding: '10px' }}>
        Login com Google
      </button>
      <button style={{ margin: '10px', padding: '10px' }}>
        Login com Email
      </button>
    </div>
  );
};

export default LandingPage;
