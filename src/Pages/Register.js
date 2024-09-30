import React from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const Register = () => {
  const handleRegister = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Usuário registrado com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar:", error);
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Criar Conta</h2>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Senha" required />
      <button type="submit">Registrar</button>
    </form>
  );
};

export default Register;
