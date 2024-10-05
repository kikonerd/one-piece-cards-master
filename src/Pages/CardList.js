import { faCheckSquare, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addDoc, collection, getDocs, increment, query, updateDoc, where } from 'firebase/firestore'; 
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styles/CardList.css';
import { auth, db } from '../firebase';

function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCards, setSelectedCards] = useState(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCriteria, setSortCriteria] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const cardsPerPage = 36;

  useEffect(() => {
    const fetchCards = async () => {
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

    fetchCards();
  }, []);

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const sortedCards = [...cards].sort((a, b) => {
    let comparison = 0;
    if (sortCriteria === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortCriteria === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortCriteria === 'quantity') {
      comparison = (a.quantity || 0) - (b.quantity || 0);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredCards = sortedCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.id.includes(searchTerm)
  );

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);

  const toggleSelectCard = (id) => {
    setSelectedCards(prev => {
      const newSelection = new Map(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.set(id, 1);
      }
      return newSelection;
    });
  };

  const handleAddCards = async () => {
    const userId = auth.currentUser.uid;
    const selectedEntries = [...selectedCards.entries()];
    try {
      toast.info("A adicionar cartas...");
      for (const [cardId, quantity] of selectedEntries) {
        const q = query(
          collection(db, "userCards"),
          where("userId", "==", userId),
          where("cardId", "==", cardId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            count: increment(quantity),
          });
        }
        else {
          await addDoc(collection(db, "userCards"), {
            userId: userId,
            cardId: cardId,
            count: quantity,
          });
        }
      }
      toast.success("Cartas adicionadas com sucesso!");
      setSelectedCards(new Map());
    } catch (error) {
      toast.error("Erro ao adicionar cartas.");
    }
  };

  return (
    <div>
      <ToastContainer />

      <div className="controls">
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
          {currentCards.length === 0 ? (
            <p>Nenhuma carta encontrada.</p>
          ) : (
            currentCards.map((card) => (
              <div
                className={card-item ${selectedCards.has(card.id) ? 'selected' : ''}}
                key={card.id}
                onClick={(e) => {
                  if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
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
                  src={https://static.dotgg.gg/onepiece/card/${card.id}.webp}
                  alt={card.name}
                />
                <h2>{card.name}</h2>
                <p style={{ color: 'blue', fontWeight: 900 }}>
                  {card.price !== "??" ? Number(card.price).toFixed(2) : card.price}€
                </p>
                <p>ID: {card.id}</p>

                <div
                  className="magnify-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImage(https://static.dotgg.gg/onepiece/card/${card.id}.webp);
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </div>

                {selectedCards.has(card.id) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCards((prev) => {
                          const newSelection = new Map(prev);
                          const currentQuantity = newSelection.get(card.id) || 1;
                          if (currentQuantity > 1) {
                            newSelection.set(card.id, currentQuantity - 1);
                          }
                          return newSelection;
                        });
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
                      {selectedCards.get(card.id) || 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCards((prev) => {
                          const newSelection = new Map(prev);
                          const currentQuantity = newSelection.get(card.id) || 1;
                          newSelection.set(card.id, currentQuantity + 1);
                          return newSelection;
                        });
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
                )}

                {showModal && (
                  <div className="modal" onClick={() => setShowModal(false)}>
                    <div className="modal-content">
                      <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                      <img src={modalImage} alt="Enlarged Card" className="enlarged-card-image" />
                      <button 
                        onClick={() => setShowModal(false)} 
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: 'red',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}>
                        X
                      </button>
                    </div>
                  </div>
                )}
              </div>

            ))
          )}
        </div>
      )}

      {selectedCards.size > 0 && (
        <button onClick={handleAddCards} className="add-cards-button">Adicionar Cartas</button>
      )}

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredCards.length / cardsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
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