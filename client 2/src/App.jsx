import { useState, useEffect } from 'react';
import supabase from './supabase/supabaseClient.js';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

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
    await supabase.from('messages').insert([{ content: newMessage }]);
    setNewMessage('');
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message.content}</div>
        ))}
      </div>
      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App;
