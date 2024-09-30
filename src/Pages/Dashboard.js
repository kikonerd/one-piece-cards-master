import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Importe o db
import { collection, query, where, getDocs } from 'firebase/firestore'; // Importe as funções necessárias do Firestore

function Dashboard({ userId }) {
    const [userCards, setUserCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const cardsPerPage = 36; // Limite de cartas por página
    const [currentPage, setCurrentPage] = useState(1); // Página atual

    useEffect(() => {
        const fetchUserCards = async () => {
            if (userId) {
                const q = query(collection(db, "cartas"), where("userId", "==", userId));
                const querySnapshot = await getDocs(q);
                const fetchedCards = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setUserCards(fetchedCards);
                setLoading(false);
            }
        };
        fetchUserCards();
    }, [userId]);

    // Filtra as cartas de acordo com o texto de busca
    const filteredCards = userCards.filter(card => 
        card.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calcular as cartas a serem exibidas na página atual
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

    // Mudar de página
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
                    setCurrentPage(1); // Reseta a página para 1 ao aplicar um filtro
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
                        currentCards.map((card) => (
                            <div className="card-item" key={card.id}>
                                <img
                                    src={`https://static.dotgg.gg/onepiece/card/${card.cardId}.webp`}
                                    alt={`Carta ${card.cardId}`} 
                                />
                                <h2>{card.cardName}</h2> {/* Nome da carta */}
                                <p>ID: {card.cardId}</p> {/* ID da carta */}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Controle de Paginação */}
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
