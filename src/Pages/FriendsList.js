import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';
import '../Styles/CardList.css';

function FriendsList({userId, onViewDeck}) {
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchFriends = async () => {
    try {
      const q = query(
        collection(db, "userFriends"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFriends(items);

    } catch (error) {
      console.error("Erro ao buscar as amigos da DB:", error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchFriends();

  const handleAddFriend = async (friendId, friendNickname) => {
    try {
      toast.info("A adicionar amigo..."); // Notificação ao iniciar a adição
      await addDoc(collection(db, "userFriends"), {
        userId: userId,
        friendId: friendId,
        friendNickname: friendNickname
      });
      toast.success("Amigo adicionado com sucesso!"); // Notificação de sucesso
      fetchFriends();
      handleSearch();
    } catch (error) {
      toast.error("Erro ao adicionar amigo."); // Notificação de erro
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      toast.info("A remover amigo..."); // Notificação ao iniciar a adição
      
      const friendDocRef = doc(db, "userFriends", friendId);
      await deleteDoc(friendDocRef);
      toast.success("Amigo removido com sucesso!"); // Notificação de sucesso
      fetchFriends();
    } catch (error) {
      console.error("Erro ao remover amigo:", error);
      toast.error("Erro ao remover amigo."); // Notificação de erro
    }
  };

  const handleSearch = async (e) => {
    setSearchTerm(e);
    if (e) {
      const q = query(collection(db, 'users'), where('nickname', '>=', e), where('nickname', '<=', e + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      let allUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const friendsNicknames = friends.map(friend => friend.friendNickname);

      const results = allUsers.filter(user => !friendsNicknames.includes(user.nickname));
      setUsers(results);
    } else {
      setUsers([]);
    }
  };

  const handleViewDeck = (friendId) => {
    onViewDeck(friendId);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ flex: 1, marginRight: '20px' }}>
        <ToastContainer /> {/* Adicione isso para permitir que as notificações apareçam */}
        <input
            type="text"
            placeholder="Procurar utilizadores..."
            value={searchTerm}
            onChange={(e) => {
                handleSearch(e.target.value);
            }}
            className="filter-input"
            style={{
                width: '60%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
            }}
        />
        
        {/* Placeholder for displaying search results */}
        <div style={{
            marginTop: '20px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            padding: '10px',
            width: '70%',
            marginLeft: '45px'
        }}>
            {filteredUsers.length ? (
                filteredUsers.map((user) => (
                    <div key={user.id} style={{
                        padding: '10px',
                        borderBottom: '1px solid #ddd',
                        justifyContent: 'space-between',
                        display: 'flex',
                        color: '#333'
                    }}>
                        {user.nickname}
                        <button onClick={() => handleViewDeck(user.id)}>Ver Deck</button>
                        <button
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                                onClick={() => handleAddFriend(user.id, user.nickname)}
                            >
                                Adicionar Amigo
                            </button>
                    </div>
                    
                ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>Nenhum resultado encontrado.</p>
            )}
        </div>
    </div>

    <div style={{ flex: 1 }}>
        {loading ? (
            <p>A carregar utilizadores...</p>
        ) : (
            <div style={{
                maxWidth: '400px',
                margin: '0',
                marginTop: '60px',
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
            }}>
                {friends && friends.length ? (
                    friends.map((friend) => (
                        <div key={friend.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '15px',
                            borderBottom: '1px solid #ddd'
                        }}>
                            <span style={{
                                fontSize: '1.1em',
                                color: '#333'
                            }}>{friend.friendNickname}</span>
                            <button onClick={() => handleViewDeck(friend.id)}>Ver Deck</button>
                            {/* <Link to={`/frienddeck/${friend.id}`}>Ver Deck</Link> */}
                            <button
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                                onClick={() => handleRemoveFriend(friend.id)}
                            >
                                Remover Amigo
                            </button>
                        </div>
                    ))
                ) : (
                    <h2 style={{
                        textAlign: 'center',
                        color: 'Black'
                    }}>Não tens amigos. Podes procurar utilizadores e adicionar amigos aqui.</h2>
                )}
            </div>
        )}
    </div>
</div>
  );
}

export default FriendsList;
