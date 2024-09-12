import './App.css';
import { useState, useEffect } from 'react';
import supabase from './supabase/supabaseClient.js';
import ChatHeader from './components/chatHeader.jsx';
import ChatRoom from './components/chatRoom.jsx';
import ChatFooter from './components/chatFooter.jsx';

// https://supabase.com/docs/guides/realtime?queryGroups=language&language=js

const App = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 모든 데이터 가져옴
    fetchMessages();

    // 'message' 테이블, 메시지 추가 이벤트 활성화(insert)
    supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .subscribe();
  }, []);

  // 'message' 테이블, 모든 데이터 가져오는 함수(select *)
  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*');
    setMessages(data);
  };

  // 'message' 테이블, 새로운 메시지 추가하는 함수(insert)
  const sendMessage = async () => {
    if (newMessage.length === 0) return;
    await supabase.from('messages').insert([{ content: newMessage, reciever: 'client', sender: 'admin' }]);
    setNewMessage('');
  };

  return (
    <div className="chat">
      <ChatHeader />
      <ChatRoom messages={messages} />
      <ChatFooter sendMessage={sendMessage} newMessage={newMessage} setNewMessage={setNewMessage} />
    </div>
  );
};

export default App;
