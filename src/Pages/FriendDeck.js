import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import '../Styles/FriendDeck.css';

const FriendDeck = () => {
  const { friendId } = useParams(); 
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [sortOrder, setSortOrder] = useState('nameAsc'); 
  const [friendNickname, setFriendNickname] = useState(''); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const q = query(collection(db, "cartas"), where("userId", "==", friendId)); 
        const querySnapshot = await getDocs(q);
        
        const cardsData = {};
        querySnapshot.docs.forEach(doc => {
          const card = doc.data();
          if (cardsData[card.cardId]) {
            cardsData[card.cardId].quantity += 1; 
          } else {
            cardsData[card.cardId] = { ...card, quantity: 1 }; 
          }
        });
        
        setCards(Object.values(cardsData)); 
      } catch (error) {
        console.error("Erro ao buscar cartas do amigo:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNickname = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', friendId)); 
        if (userDoc.exists()) {
          setFriendNickname(userDoc.data().nickname); 
        }
      } catch (error) {
        console.error("Erro ao buscar nickname do amigo:", error);
      }
    };

    fetchCards();
    fetchNickname();
  }, [friendId]);

  const sortCards = (cards) => {
    return [...cards].sort((a, b) => {
      if (sortOrder === 'nameAsc') {
        return a.name.localeCompare(b.name); 
      } else if (sortOrder === 'nameDesc') {
        return b.name.localeCompare(a.name); 
      } else if (sortOrder === 'idAsc') {
        return a.cardId.localeCompare(b.cardId); 
      } else if (sortOrder === 'idDesc') {
        return b.cardId.localeCompare(a.cardId); 
      } else if (sortOrder === 'priceAsc') {
        return a.price - b.price; 
      } else if (sortOrder === 'priceDesc') {
        return b.price - a.price; 
      }
      return 0; 
    });
  };

  const filteredCards = sortCards(cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.cardId.includes(searchTerm) 
  ));

  return (
    <div>
      <button onClick={() => navigate("/")}>INICIO</button> 
      <h2>Deck de {friendNickname || 'Carregando...'}</h2>
      <input 
        type="text" 
        placeholder="Filtrar cartas..." 
        className="deck-filter-input" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      <div>
        <button onClick={() => setSortOrder('nameAsc')} className={sortOrder === 'nameAsc' ? 'selected' : ''}>Ordenar por Nome (Crescente)</button>
        <button onClick={() => setSortOrder('nameDesc')} className={sortOrder === 'nameDesc' ? 'selected' : ''}>Ordenar por Nome (Decrescente)</button>
        <button onClick={() => setSortOrder('idAsc')} className={sortOrder === 'idAsc' ? 'selected' : ''}>Ordenar por ID (Crescente)</button>
        <button onClick={() => setSortOrder('idDesc')} className={sortOrder === 'idDesc' ? 'selected' : ''}>Ordenar por ID (Decrescente)</button>
        <button onClick={() => setSortOrder('priceAsc')} className={sortOrder === 'priceAsc' ? 'selected' : ''}>Ordenar por Preço (Crescente)</button>
        <button onClick={() => setSortOrder('priceDesc')} className={sortOrder === 'priceDesc' ? 'selected' : ''}>Ordenar por Preço (Decrescente)</button>
      </div>
      {loading ? (
        <p>A carregar cartas...</p>
      ) : (
        <div className="deck-container">
          {filteredCards.length === 0 ? (
            <p>Nenhuma carta encontrada.</p>
          ) : (
            filteredCards.map(card => (
              <div key={card.cardId} className="card">
                <img 
                  src={`https://static.dotgg.gg/onepiece/card/${card.cardId}.webp`} 
                  alt={card.name} 
                />
                <h3>{card.name}</h3>
                <p>ID: {card.cardId}</p> 
                <p>Quantidade: {card.quantity}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FriendDeck;
