import { collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';

function UserCardList({ userId }) {
  const [userCards, setUserCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const cardsPerPage = 36; 
  const [currentPage, setCurrentPage] = useState(1); 
  const [cardQuantities, setCardQuantities] = useState({}); // Estado para armazenar quantidades

  useEffect(() => {
    if (userId) {
      fetchCards(); // Chama a função ao montar o componente
    }
  }, [userId]);

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
  const filteredCards = groupedCards.filter(card => 
    card.cardId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular as cartas a serem exibidas na página atual
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRemoveCards = async () => {
    try {
      toast.info("A remover cartas..."); // Notificação ao iniciar a remoção

      for (const card of currentCards) {
        const quantityToRemove = cardQuantities[card.cardId] || 0;

        // Verifica se a quantidade a remover é maior que 0
        if (quantityToRemove > 0) {
          const querySnapshot = await getDocs(query(collection(db, "cartas"), where("userId", "==", userId), where("cardId", "==", card.cardId)));

          // Remover a quantidade especificada de cartas
          let removalCount = quantityToRemove; // Contador de remoções
          for (const doc of querySnapshot.docs) {
            if (removalCount > 0) {
              await deleteDoc(doc.ref); // Remove a carta do Firestore
              removalCount--; // Decrementa a quantidade a remover
            }
          }

          // Atualiza a quantidade local
          card.quantity -= quantityToRemove; // Atualiza a quantidade local
          if (card.quantity <= 0) {
            // Se a quantidade for 0 ou menor, remove a carta da lista
            setUserCards(prev => prev.filter(item => item.cardId !== card.cardId));
          }
        }
      }

      setCardQuantities({}); // Reseta as quantidades após remover
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
                <input 
                  type="number" 
                  min="0" 
                  max={card.quantity} 
                  value={cardQuantities[card.cardId] || 0} 
                  onChange={(e) => setCardQuantities({ 
                    ...cardQuantities, 
                    [card.cardId]: Number(e.target.value) 
                  })} 
                  placeholder="Quantidade a remover"
                />
              </div>
            ))
          )}
        </div>
      )}

      <button onClick={handleRemoveCards} className="remove-cards-button" disabled={Object.keys(cardQuantities).length === 0}>
        Remover Cartas Selecionadas
      </button>

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

export default UserCardList;
