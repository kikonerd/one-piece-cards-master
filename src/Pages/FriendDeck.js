import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';

function FriendDeck({friendId}) {
  const [cards, setCards] = useState([]);
  const [friendCards, setFriendCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (friendId) {
      fetchFriendCards();
    }
  }, [friendId]);

  const fetchFriendCards = async () => {
    try {
      // Fetching friend's cards from Firestore
      const q = query(collection(db, "userCards"), where("userId", "==", friendId));
      const querySnapshot = await getDocs(q);
      const fetchedCards = querySnapshot.docs.map(doc => doc.data());
      setFriendCards(fetchedCards);
      
      // Fetching card details from the API
      const response = await fetch("/cgfw/getcards?game=onepiece&mode=indexed");
      if (!response.ok) {
        throw new Error(`Error fetching cards: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.data && Array.isArray(data.data)) {
        const formattedCards = data.data.map((card) => ({
          id: card[0],
          id_normal: card[1],
          name: card[4] || 'Name not available',
          price: card[16] || '??'
        }));
        setCards(formattedCards);
      }
    } catch (error) {
      console.error("Error fetching friend cards:", error);
      toast.error("Failed to fetch friend's cards.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <h1>Friend's Deck</h1>
      <input
        type="text"
        placeholder="Filter cards..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="filter-input"
      />

      {loading ? (
        <p>Loading cards...</p>
      ) : (
        <div className="card-list">
          {friendCards.length === 0 ? (
            <p>No cards added by this friend.</p>
          ) : (
            friendCards.filter(card => 
              cards.find(c => c.id === card.cardId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((card) => (
              <div className="card-item" key={card.cardId}>
                <img
                  src={`https://static.dotgg.gg/onepiece/card/${card.cardId}.webp`}
                  alt={`Card ${card.cardId}`} 
                />
                <h2>{cards.find((c) => c.id === card.cardId)?.name || 'Name not available'}</h2>
                <p style={{ color: 'blue', fontWeight: 900 }}>
                  {cards.find((c) => c.id === card.cardId)?.price !== "??" 
                    ? Number(cards.find((c) => c.id === card.cardId)?.price).toFixed(2) 
                    : card.price}€
                </p>
                <p>ID: {card.cardId}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default FriendDeck;
