import './App.css';
import { useState, useEffect, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from './supabase/supabaseClient.js';
import ChatHeader from './components/chatHeader.jsx';
import ChatRoom from './components/chatRoom.jsx';
import ChatFooter from './components/chatFooter.jsx';

// https://supabase.com/docs/guides/realtime?queryGroups=language&language=js

const who = 'client';
export const MyContext = createContext(null);

const App = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState();

  useEffect(() => {
    // room_id 할당
    const room_id = uuidv4();
    setRoomId(roomId);

    // 'messages' 테이블, 모든 데이터 가져옴
    fetchMessages(room_id);

    // 'message' 테이블, 메시지 추가 이벤트 활성화(insert)
    supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .subscribe();

    // 'user_status' 테이블 이벤트 설정
    supabase
      .channel('user_status')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_status' }, (payload) => {
        console.log('user_status', payload);
      })
      .subscribe();

    // Realtime 'presence'
    const roomTwo = supabase.channel('room-one');
    const userStatus = {
      user: 'user-2',
      online_at: new Date().toISOString(),
      user_type: 'client',
      room_id: room_id,
    };

    roomTwo.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;

      const presenceTrackStatus = await roomTwo.track(userStatus);
      console.log(presenceTrackStatus);
    });
  }, []);

  // 'message' 테이블, 모든 데이터 가져오는 함수(select *)
  const fetchMessages = async (room_id) => {
    const { data } = await supabase.from('messages').select().eq('room_id', room_id);
    setMessages(data);
  };

  // 'message' 테이블, 새로운 메시지 추가하는 함수(insert)
  const sendMessage = async () => {
    if (newMessage.length === 0) return;
    await supabase.from('messages').insert([{ content: newMessage, user_type: who }]);
    setNewMessage('');
  };

  return (
    <MyContext.Provider value={who}>
      <div className="chat">
        <ChatHeader />
        <ChatRoom messages={messages} />
        <ChatFooter sendMessage={sendMessage} newMessage={newMessage} setNewMessage={setNewMessage} />
      </div>
    </MyContext.Provider>
  );
};

export default App;
