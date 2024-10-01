import { collection, deleteDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';

function UserCardList({ userId }) {
  const [cards, setCards] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      fetchAllCards();
      fetchCards(); 
    }
  }, [userId]);
  
  const fetchAllCards = async () => {
    try {
      const response = await fetch("/cgfw/getcards?game=onepiece&mode=indexed");
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.data && Array.isArray(data.data)) {
        const formattedCards = data.data.map((card) => ({
          id: card[0],
          id_normal: card[1],
          name: card[4] || 'Nome não disponível',
          price: card[16] || '??'
        }));

        setCards(formattedCards);
      }
    } catch (error) {
      console.error("Erro ao buscar as cartas da API:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const q = query(collection(db, "userCards"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const fetchedCards = querySnapshot.docs.map(doc => doc.data());
      setUserCards(fetchedCards);
    } catch (error) {
      console.error("Erro ao buscar as cartas do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCards = async () => {
    try {
      toast.info("A atualizar cartas..."); // Notificação ao iniciar a remoção

      for (const card of userCards) {
        const q = query(
          collection(db, 'userCards'),
          where('userId', '==', userId),
          where('cardId', '==', card.cardId),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {        
          const doc = querySnapshot.docs[0];  // Get the first document
          const cardDocRef = doc.ref;

          if (card.count === 0) {
            await deleteDoc(cardDocRef); 
          } else {
            await updateDoc(cardDocRef, {
              count: card.count,
            });
          }
        }
      }

      toast.success("Cartas removidas com sucesso!"); // Notificação de sucesso

      // Atualiza a lista de cartas após 3 segundos
      setTimeout(() => {
        fetchCards(); // Recarrega as cartas
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao remover cartas:", error);
    }
  };

  return (
    <div>
      <ToastContainer />
      <input
        type="text"
        placeholder="Filtrar cartas..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        className="filter-input"
      />

      {loading ? (
        <p>A carregar cartas...</p>
      ) : (
        <div className="card-list">
          {userCards.length === 0 ? (
            <p>Nenhuma carta adicionada.</p>
          ) : (
            userCards.map((card) => (
              <div className="card-item" key={card.cardId}>
                <img
                  src={`https://static.dotgg.gg/onepiece/card/${card.cardId}.webp`}
                  alt={`Carta ${card.cardId}`} 
                />
                <h2>{cards.find((c) => c.id === card.cardId)?.name || 'Nome não disponível'}</h2>
                <p style={{ color: 'blue', fontWeight: 900 }}>
                  {cards.find((c) => c.id === card.cardId)?.price !== "??" ? Number(cards.find((c) => c.id === card.cardId)?.price).toFixed(2) : card.price}€
                </p>
                <p>ID: {card.cardId}</p>
                {/* <div className="quantity-badge">
                  {card.count} {/* Mostra a quantidade da carta
                </div> */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserCards((prev) => 
                          prev.map((c) => {
                            if (c.cardId === card.cardId && c.count > 0) {
                              return { ...c, count: c.count - 1 };
                            }
                            return c;
                          })
                        );
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {card.count}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserCards((prev) => 
                          prev.map((c) => {
                            if (c.cardId === card.cardId) {
                              return { ...c, count: c.count + 1 };
                            }
                            return c;
                          })
                        );
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      +
                    </button>
                  </div>
              </div>
            ))
          )}
        </div>
      )}

      <button onClick={handleUpdateCards} className="remove-cards-button">
        Atualizar Cartas
      </button>
    </div>
  );
}

export default UserCardList;
