import React, { useEffect, useState } from 'react';
import '../Styles/CardList.css'; // Importe o arquivo de estilo
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons'; // Importa o ícone de check

function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardsIds, setSelectedCardsIds] = useState(new Set()); // Usar um Set para gerenciar seleções
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

        if (data && data.data && Array.isArray(data.data)) {
          const formattedCards = data.data.map((card) => ({
            id: card[0],
            id_normal: card[1],
            name: card[4] || 'Nome não disponível',
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

  // Filtra as cartas de acordo com o texto de busca
  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular as cartas a serem exibidas na página atual
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  // Mudar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Função para alternar a seleção de uma carta
  const toggleSelectCard = (id) => {
    setSelectedCardsIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id); // Remove se já estiver selecionada
      } else {
        newSelection.add(id); // Adiciona se não estiver selecionada
      }
      return newSelection;
    });
  };

  // Função para adicionar cartas selecionadas (lógica que você pode implementar)
  const handleAddCards = () => {
    console.log("Cartas adicionadas:", [...selectedCardsIds]);
    // Aqui você pode adicionar a lógica para salvar as cartas selecionadas na base de dados
  };

  return (
    <div>
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

      {loading ? (
        <p>A carregar cartas...</p>
      ) : (
        <div className="card-list">
          {currentCards.length === 0 ? (
            <p>Nenhuma carta encontrada.</p>
          ) : (
            currentCards.map((card) => (
              <div 
                className={`card-item ${selectedCardsIds.has(card.id) ? 'selected' : ''}`} 
                key={card.id}
                onClick={() => toggleSelectCard(card.id)} // Adiciona evento de clique
                style={{ position: 'relative' }} // Para posicionar o quadrado de seleção
              >
                <div className="select-box">
                  {selectedCardsIds.has(card.id) && (
                    <FontAwesomeIcon icon={faCheckSquare} style={{ color: 'green' }} />
                  )}
                </div>
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

      {/* Botão Adicionar Cartas */}
      <button onClick={handleAddCards} className="add-cards-button">Adicionar Cartas</button>

      {/* Controle de Paginação */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredCards.length / cardsPerPage) }, (_, index) => (
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
