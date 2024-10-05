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
  const [sortCriteria, setSortCriteria] = useState(''); // Critério de ordenação
  const [sortOrder, setSortOrder] = useState('asc'); // Ordem de ordenação
  const [totalValue, setTotalValue] = useState(0); // Armazenar o valor total do deck

  useEffect(() => {
    if (userId) {
      fetchAllCards();
      fetchCards(); 
    }
  }, [userId]);

  useEffect(() => {
    calculateTotalValue(); // Recalcular o valor total sempre que as cartas forem atualizadas
  }, [userCards, cards]);

  const fetchAllCards = async () => {
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

  // Função para calcular o valor total do deck
  const calculateTotalValue = () => {
    let total = 0;

    userCards.forEach(userCard => {
      const matchingCard = cards.find(card => card.id === userCard.cardId);
      if (matchingCard && matchingCard.price !== "??") {
        total += parseFloat(matchingCard.price) * userCard.count;
      }
    });

    setTotalValue(total.toFixed(2));
  };

  const handleUpdateCards = async () => {
    try {
      toast.info("A atualizar cartas...");
      for (const card of userCards) {
        const q = query(
          collection(db, 'userCards'),
          where('userId', '==', userId),
          where('cardId', '==', card.cardId),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const cardDocRef = doc.ref;

          if (card.count === 0) {
            await deleteDoc(cardDocRef); // Se a contagem for 0, remover a carta
          } else {
            await updateDoc(cardDocRef, {
              count: card.count,
            });
          }
        }
      }

      toast.success("Cartas atualizadas com sucesso!");

      // Atualiza a lista de cartas após 3 segundos
      setTimeout(() => {
        fetchCards();
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao atualizar cartas:", error);
    }
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const sortedCards = userCards
    .map(userCard => {
      const matchingCard = cards.find(card => card.id === userCard.cardId);
      return {
        ...userCard,
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

      {/* Exibe o valor total do deck */}
      <h2 style={{ color: 'white', marginLeft: '55px', textAlign: 'left' }}>
        Valor total do deck: {totalValue}€
      </h2>

      <div className="controls" style={{ marginLeft: '15px' }}>
        <input
          type="text"
          placeholder="Filtrar cartas..."
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
        <p>A carregar cartas...</p>
      ) : (
        <div className="card-list">
          {sortedCards.length === 0 ? (
            <p>Nenhuma carta adicionada.</p>
          ) : (
            sortedCards.map((card) => (
              <div className="card-item" key={card.cardId}>
                <img
                  src={`https://static.dotgg.gg/onepiece/card/${card.cardId}.webp`}
                  alt={`Carta ${card.cardId}`} 
                />
                <h2>{cards.find((c) => c.id === card.cardId)?.name || 'Nome não disponível'}</h2>
                <p style={{ color: 'blue', fontWeight: 900 }}>
                  {cards.find((c) => c.id === card.cardId)?.price !== "??" 
                    ? Number(cards.find((c) => c.id === card.cardId)?.price).toFixed(2) 
                    : card.price}€
                </p>
                <p>ID: {card.cardId}</p>
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
