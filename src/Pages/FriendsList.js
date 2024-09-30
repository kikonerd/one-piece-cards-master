import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';
import '../Styles/CardList.css';


function FriendsList({userId}) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const fetchFriends = async () => {
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

          setFriends(formattedCards);
        }
      } catch (error) {
        console.error("Erro ao buscar as cartas da API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleAddFriend = async (friendId) => {
    try {
      toast.info("A adicionar amigo..."); // Notificação ao iniciar a adição
      await addDoc(collection(db, "userFriends"), {
        userId: userId,
        friendId: friendId,
      });
      toast.success("Amigo adicionado com sucesso!"); // Notificação de sucesso
    } catch (error) {
      console.error("Erro ao adicionar amigo:", error);
      toast.error("Erro ao adicionar amigo."); // Notificação de erro
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
        }}
        className="filter-input"
      />

      {loading ? (
        <p>A carregar utilizadores...</p>
      ) : (
        <div className="friend-list">
          {/* {friendsList.length === 0 ? (
            <p>Nenhuma carta encontrada.</p>
          ) : (
            // friendsList.map((card) => (

            ))
          )} */}
        </div>
      )}
    </div>
  );
}

export default FriendsList;
