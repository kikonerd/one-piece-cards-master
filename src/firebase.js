// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB58yXawQrBmS1vDEYaLZhaqXV3O-AaGq8",
  authDomain: "one-piece-cards-70035.firebaseapp.com",
  projectId: "one-piece-cards-70035",
  storageBucket: "one-piece-cards-70035.appspot.com",
  messagingSenderId: "631857885408",
  appId: "1:631857885408:web:9b911e3a381dc2ab78a085"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Configura o auth
const db = getFirestore(app); // Configura o Firestore

export { auth, db };
