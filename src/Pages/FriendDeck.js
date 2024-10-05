import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';

function FriendDeck({ friendId, friendNickname }) {
  const [cards, setCards] = useState([]);
  const [friendCards, setFriendCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState(''); // Novo estado para ordenação
  const [sortOrder, setSortOrder] = useState('asc'); // Novo estado para a ordem de ordenação

  const fetchCards = async () => {
    try {
      setLoading(true);
      const cachedCards = JSON.parse(localStorage.getItem('cards'));
      const cacheTimestamp = localStorage.getItem('cards-timestamp');
      const oneDay = 24 * 60 * 60 * 1000;

      if (cachedCards && cacheTimestamp && (Date.now() - cacheTimestamp) < oneDay) {
        setCards(cachedCards);
      } else {
        const q = query(collection(db, "cards"));
        const querySnapshot = await getDocs(q);
        const fetchedCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem('cards', JSON.stringify(fetchedCards));
        localStorage.setItem('cards-timestamp', Date.now());
        setCards(fetchedCards);
      }
    } catch (error) {
      console.error("Error fetching cards from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (friendId) {
      fetchFriendCards();
    }
  }, [friendId]);

  const fetchFriendCards = async () => {
    try {
      const q = query(collection(db, "userCards"), where("userId", "==", friendId));
      const querySnapshot = await getDocs(q);
      const fetchedCards = querySnapshot.docs.map(doc => doc.data());
      setFriendCards(fetchedCards);
      fetchCards();
    } catch (error) {
      console.error("Error fetching friend cards:", error);
      toast.error("Failed to fetch friend's cards.");
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const sortedCards = friendCards
    .map(friendCard => {
      const matchingCard = cards.find(card => card.id === friendCard.cardId);
      return {
        ...friendCard,
        name: matchingCard ? matchingCard.name : 'Nome não disponível',
      };
    })
    .filter(card =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.cardId.includes(searchTerm)
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortCriteria === 'id') {
        comparison = a.cardId.localeCompare(b.cardId);
      } else if (sortCriteria === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortCriteria === 'quantity') {
        comparison = a.count - b.count;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div>
      <ToastContainer />
      <h1>Deck de {friendNickname}</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />

        <div className="sorting-controls">
          <label htmlFor="sort">Ordenar por: </label>
          <select id="sort" value={sortCriteria} onChange={handleSortChange}>
            <option value="">Selecione</option>
            <option value="id">ID</option>
            <option value="name">Nome</option>
            <option value="quantity">Quantidade</option>
          </select>

          <label htmlFor="order">Ordem: </label>
          <select id="order" value={sortOrder} onChange={handleSortOrderChange}>
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading cards...</p>
      ) : (
        <div className="card-list">
          {sortedCards.length === 0 ? (
            <p>No cards added by this friend.</p>
          ) : (
            sortedCards.map((card) => (
              <div className="card-item" key={card.cardId}>
                <img
                  src={`https://static.dotgg.gg/onepiece/card/${card.cardId}.webp`}
                  alt={`Card ${card.cardId}`} 
                />
                <h2>{card.name}</h2>
                <p style={{ color: 'blue', fontWeight: 900 }}>
                  {cards.find((c) => c.id === card.cardId)?.price !== "??"
                    ? Number(cards.find((c) => c.id === card.cardId)?.price).toFixed(2)
                    : card.price}€
                </p>
                <p>ID: {card.cardId}</p>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {card.count}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default FriendDeck;
