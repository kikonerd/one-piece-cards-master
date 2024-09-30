import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore'; 

function Dashboard({ userId }) {
  const [userCards, setUserCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const cardsPerPage = 36; 
  const [currentPage, setCurrentPage] = useState(1); 

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const q = query(collection(db, "cartas"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const fetchedCards = querySnapshot.docs.map(doc => doc.data());
        setUserCards(fetchedCards);
      } catch (error) {
        console.error("Erro ao buscar as cartas do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCards();
    }
  }, [userId]);

  // Agrupar cartas por cardId e contar o número de cópias
  const groupedCards = userCards.reduce((acc, card) => {
    const existingCard = acc.find(item => item.cardId === card.cardId);
    if (existingCard) {
      existingCard.quantity += 1; // Incrementa a quantidade
    } else {
      acc.push({ ...card, quantity: 1 }); // Adiciona nova carta com quantidade 1
    }
    return acc;
  }, []);

  // Filtra as cartas de acordo com o texto de busca
// Filtra as cartas de acordo com o texto de busca
const filteredCards = groupedCards.filter(card => 
  card.cardId.toLowerCase().includes(searchTerm.toLowerCase()) || // Filtra por ID
  card.name.toLowerCase().includes(searchTerm.toLowerCase()) // Filtra por nome
);


  // Calcular as cartas a serem exibidas na página atual
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Filtrar cartas..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="filter-input"
      />

      {loading ? (
        <p>A carregar cartas...</p>
      ) : (
        <div className="card-list">
          {currentCards.length === 0 ? (
            <p>Nenhuma carta adicionada.</p>
          ) : (
            currentCards.map((card, index) => (
              <div className="card-item" key={index}>
                <img
                  src={`https://static.dotgg.gg/onepiece/card/${card.cardId}.webp`}
                  alt={`Carta ${card.cardId}`} 
                />
                <h2>{card.name || 'Nome não disponível'}</h2>
                <p>ID: {card.cardId}</p>
                <div className="quantity-badge">
                  {card.quantity} {/* Mostra a quantidade da carta */}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredCards.length / cardsPerPage) }, (_, index) => (
          <button 
            key={index + 1} 
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
            disabled={currentPage === index + 1}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
