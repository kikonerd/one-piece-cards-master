// CardList.js
import React, { useEffect, useState } from 'react';
import '../Styles/CardList.css'; // Importe o arquivo de estilo

function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const cardsPerPage = 36; // Número de cartas por página

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch("/cgfw/getcards?game=onepiece&mode=indexed");
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        console.log("Dados retornados da API:", data);

        if (data && data.data && Array.isArray(data.data)) {
          const formattedCards = data.data.map((card) => ({
            id: card[0],
            id_normal: card[1],
            name: card[4] || 'Nome não disponível',
          }));

          setCards(formattedCards);
        } else {
          console.error("Os dados retornados não são válidos:", data);
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
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filtrar cartas..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reseta a página para 1 ao aplicar um filtro
          }}
          className="filter-input"
        />
      </div>
      
      {loading ? (
        <p>A carregar cartas...</p>
      ) : (
        <div className="card-list">
          {currentCards.length === 0 ? (
            <p>Nenhuma carta encontrada.</p>
          ) : (
            currentCards.map((card) => (
              <div className="card-item" key={card.id}>
                <img 
                  src={`https://static.dotgg.gg/onepiece/card/${card.id_normal}.webp`} 
                  alt={card.name} 
                />
                <h2>{card.name}</h2>
                <p>ID: {card.id_normal}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Botão para adicionar cartas */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button onClick={() => console.log('Adicionar cartas')} className="button">Adicionar Cartas</button>
      </div>

      {/* Controle de Paginação */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button 
            key={index + 1} 
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''} // Adiciona a classe 'active' se for a página atual
            disabled={currentPage === index + 1} // Desabilita o botão da página atual
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CardList;
