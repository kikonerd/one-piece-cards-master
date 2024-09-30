// src/Login.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function Login() {
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("Usuário logado com sucesso.");
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Erro ao logar:", error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {errorMessage && <p>{errorMessage}</p>}
      <button onClick={handleGoogleSignIn}>Login com Google</button>
    </div>
  );
}

export default Login;
