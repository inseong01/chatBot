import './App.css';
import { useState, useEffect, createContext, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from './supabase/supabaseClient.js';
import ChatHeader from './components/chatHeader.jsx';
import ChatRoom from './components/chatRoom.jsx';
import ChatFooter from './components/chatFooter.jsx';

// https://supabase.com/docs/guides/realtime?queryGroups=language&language=js

const who = 'client';
export const MyContext = createContext(null);

// 갱신 정보 덮어씌우는 함수
const overwriteMessage = (prev, data) => {
  return prev.map((item) => {
    const findUpdateItem = data.find((d) => d.id === item.id);
    return findUpdateItem ? findUpdateItem : item;
  });
};

const App = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [oppntUserInfo, setOppntUserInfo] = useState({});
  const roomId = useRef(null);

  useEffect(() => {
    // room_id 할당
    const room_id = uuidv4();
    roomId.current = room_id;

    // 'messages' 테이블, ID 데이터 가져옴
    fetchMessages(room_id);

    // 'message' 테이블, 메시지 추가 이벤트 활성화(insert)
    supabase
      .channel('messages')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        console.log('UPDATE', payload);
        setMessages((prev) => overwriteMessage(prev, [payload.new]));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.room_id !== room_id) return;
        setMessages((prevMessages) => [...prevMessages, payload.new]);
        console.log('INSERT', payload);
      })
      .subscribe();

    // 'user_status' 테이블 이벤트 설정
    supabase
      .channel('user_status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_status' }, (payload) => {
        setOppntUserInfo(payload.new);
        console.log('user_status UPDATE', payload);
      })
      .on('postgres_changes', { event: 'SELECT', schema: 'public', table: 'user_status' }, (payload) => {
        console.log('user_status SELECT', payload);
      })
      .subscribe();

    // Realtime 'presence'
    const roomTwo = supabase.channel('room-one');
    const userStatus = {
      user: 'user-2',
      online_at: new Date().toISOString(),
      user_type: who,
      room_id: room_id,
    };

    roomTwo.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;
      const presenceTrackStatus = await roomTwo.track(userStatus);
      console.log(presenceTrackStatus);
    });
  }, []);

  // 메시지 업데이트 조건 1 - 읽음
  useEffect(() => {
    if (!isFocused) return;
    updateMessage();
  }, [isFocused]);

  // 유저 업데이트 조건 2 - 입력중
  useEffect(() => {
    if (newMessage.length > 1) return;
    if (newMessage === '') {
      updateUser(false);
    } else {
      updateUser(true);
    }
  }, [newMessage]);

  // 'message' 테이블, 모든 데이터 가져오는 함수(select *)
  const fetchMessages = async (id) => {
    const { data } = await supabase.from('messages').select('*').eq('room_id', id);
    setMessages(data);
  };

  // 'message' 테이블, 새로운 메시지 추가하는 함수(insert)
  const sendMessage = async () => {
    if (newMessage.length === 0) return;
    await supabase
      .from('messages')
      .insert([{ content: newMessage, user_type: who, room_id: roomId.current, is_read: false }]);
    setNewMessage('');
    setIsFocused(false);
    updateUser(false);
  };

  // 'message' 테이블, 메시지 상태 갱신하는 함수
  const updateMessage = async () => {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .match({ room_id: roomId.current, user_type: 'admin', is_read: false })
      .order('id', { ascending: false })
      .select();
    if (error) return console.error('UpdateMessage Error', error);
    console.log('updateMessage', data);
  };

  // 'user_status' 테이블, 본인 상태 갱신 함수
  const updateUser = async (isTyping) => {
    const { data, error } = await supabase
      .from('user_status')
      .update({ is_typing: isTyping })
      .match({ room_id: roomId.current, user_type: who, status: 'online' })
      .select();
    if (error) return console.error('UpdateUser Error', error);
  };

  return (
    <MyContext.Provider value={who}>
      <div className="chat">
        <ChatHeader />
        <ChatRoom messages={messages} />
        <ChatFooter
          sendMessage={sendMessage}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          setIsFocused={setIsFocused}
        />
      </div>
    </MyContext.Provider>
  );
};

export default App;
