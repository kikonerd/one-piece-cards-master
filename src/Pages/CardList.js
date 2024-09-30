import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, db } from '../firebase';
import '../Styles/CardList.css';


function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCards, setSelectedCards] = useState(new Map());
  const [currentPage, setCurrentPage] = useState(1); 
  const cardsPerPage = 36; 

  

  useEffect(() => {
    const fetchCards = async () => {
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

    fetchCards();
  }, []);

  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleSelectCard = (id) => {
    setSelectedCards(prev => {
      const newSelection = new Map(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.set(id, 1); // Adiciona com contagem 1 se não estiver selecionada
      }
      return newSelection;
    });
  };

  const handleAddCards = async () => {
    const userId = auth.currentUser.uid;
    const selectedEntries = [...selectedCards.entries()];
  
    try {
      toast.info("A adicionar cartas..."); // Notificação ao iniciar a adição
      for (const [cardId, quantity] of selectedEntries) {
        for (let i = 0; i < quantity; i++) {
          await addDoc(collection(db, "cartas"), {
            userId: userId,
            cardId: cardId,
            name: cards.find(card => card.id === cardId).name,
            timestamp: new Date()
          });
        }
      }
      toast.success("Cartas adicionadas com sucesso!"); // Notificação de sucesso
      console.log("Cartas adicionadas com sucesso!");
      setSelectedCards(new Map());
    } catch (error) {
      console.error("Erro ao adicionar cartas:", error);
      toast.error("Erro ao adicionar cartas."); // Notificação de erro
    }
  };
  

  return (
    <div>
      <ToastContainer /> {/* Adicione isso para permitir que as notificações apareçam */}
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
            <p>Nenhuma carta encontrada.</p>
          ) : (
            currentCards.map((card) => (
              <div 
                className={`card-item ${selectedCards.has(card.id) ? 'selected' : ''}`} 
                key={card.id}
                onClick={(e) => {
                  // Evitar que a seleção do card desmarque o campo de entrada
                  if (e.target.tagName !== 'INPUT') {
                    toggleSelectCard(card.id);
                  }
                }} 
                style={{ position: 'relative' }} 
              >
                <div className="select-box">
                  {selectedCards.has(card.id) && (
                    <FontAwesomeIcon icon={faCheckSquare} style={{ color: 'green' }} />
                  )}
                </div>
                <img 
                  src={`https://static.dotgg.gg/onepiece/card/${card.id}.webp`} 
                  alt={card.name} 
                />
                <h2>{card.name}</h2>
                <p style={{color: 'green', fontWeight: 900}}>{card.price !== "??" ? Number(card.price).toFixed(2) : card.price}€</p>
                <p>ID: {card.id}</p>
                {selectedCards.has(card.id) && (
                  <input 
                    type="number" 
                    min="1" 
                    value={selectedCards.get(card.id)} 
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 1;
                      setSelectedCards(prev => {
                        const newSelection = new Map(prev);
                        newSelection.set(card.id, quantity);
                        return newSelection;
                      });
                    }} 
                    onClick={(e) => e.stopPropagation()} // Impede que o click no input desmarque o card
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      <button onClick={handleAddCards} className="add-cards-button">Adicionar Cartas</button>

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



export default CardList;
