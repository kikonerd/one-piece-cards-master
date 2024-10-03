import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';

function FriendDeck({friendId, friendNickname}) {
  const [cards, setCards] = useState([]);
  const [friendCards, setFriendCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCards = async () => {
    try {
      setLoading(true); // Set loading to true before fetching data
      const q = query(collection(db, "cards")); // Query to get user-specific cards
      const querySnapshot = await getDocs(q); // Fetch the documents from Firestore
  
      const fetchedCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Get card data and include the document ID
  
      setCards(fetchedCards); // Set the state with fetched cards
    } catch (error) {
      console.error("Error fetching cards from Firestore:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
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

  const filteredCards = friendCards
  .map(friendCard => {
    // Find the card in the 'cards' array that corresponds to this friendCard
    const matchingCard = cards.find(card => card.id === friendCard.cardId);

    // Combine the friendCard data with the matching card's name (if found)
    return {
      ...friendCard,
      name: matchingCard ? matchingCard.name : 'Nome não disponível', // Add name from matching card
    };
  })
  .filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.cardId.includes(searchTerm) // Filter by name or card ID
  );

  return (
    <div>
      <ToastContainer />
      <h1>Deck de {friendNickname}</h1>
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
          {filteredCards.length === 0 ? (
            <p>No cards added by this friend.</p>
          ) : (
            filteredCards.map((card) => (
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
