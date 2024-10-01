import './App.css';
import { useState, useEffect, createContext, useRef, useTransition } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from './supabase/supabaseClient.js';
import ChatHeader from './components/chatHeader.jsx';
import ChatRoom from './components/chatRoom.jsx';
import ChatFooter from './components/chatFooter.jsx';

// https://supabase.com/docs/guides/realtime?queryGroups=language&language=js

const who = 'client';
export const MyContext = createContext(null);

// 갱신 정보 덮어씌우는 함수
const overwriteData = (prev, data, type) => {
  return prev.map((item) => {
    switch (type) {
      case 'user_status': {
        const findUpdateItme = data.find((d) => d.room_id === item[0].room_id);
        // console.log(prev, data, findUpdateItme);
        return findUpdateItme ? [findUpdateItme] : item;
      }
      case 'messages': {
        const findUpdateItme = data.find((d) => d.id === item[0].id);
        return findUpdateItme ? [findUpdateItme] : item;
      }
      default:
        return console.error('overwriteData Error');
    }
  });
};

const App = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [oppntUserInfo, setOppntUserInfo] = useState({});
  const [isEnter, setIsEnter] = useState(false);

  const roomId = useRef(null);

  useEffect(() => {
    // room_id 할당
    const room_id = uuidv4();
    roomId.current = room_id;

    // 'message' 테이블, 메시지 이벤트 활성화
    supabase
      .channel('messages')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        console.log('UPDATE', payload);
        setMessages((prev) => overwriteData(prev, [payload.new], 'messages'));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.room_id !== room_id) return;
        setMessages((prevMessages) => [...prevMessages, [payload.new]]);
        // console.log('INSERT', payload.new);
      })
      .subscribe();

    // 'user_status' 테이블 이벤트 설정
    supabase
      .channel('user_status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_status' }, (payload) => {
        if (payload.new.user_type === 'admin') {
          setOppntUserInfo({ status: true, is_typing: payload.new.is_typing });
        }
        // console.log('user_status UPDATE', payload);
      })
      .subscribe();

    // 'bot_questions' 테이블 이벤트 설정
    supabase
      .channel('bot_questions')
      .on('postgres_changes', { event: 'SELECT', schema: 'public', table: 'bot_questions' }, (payload) => {
        // console.log('bot_questions SELECT', payload);
      })
      .subscribe();

    // Realtime 'presence'
    const roomOne = supabase.channel('room-one');
    const userStatus = {
      user: 'user-2',
      online_at: new Date().toISOString(),
      user_type: who,
      room_id: room_id,
    };
    roomOne
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // console.log('join', newPresences);
        const adminIndex = newPresences.findIndex((presence) => presence.user_type === 'admin');
        if (adminIndex === -1) setOppntUserInfo((prev) => ({ ...prev, status: false, is_typing: false }));
      })
      .on('presence', { event: 'sync' }, () => {
        // console.log('sync');
        const newState = roomOne.presenceState();
        const adminIndex = Object.keys(newState).findIndex((key) => newState[key][0].user_type === 'admin');
        if (adminIndex === -1) setOppntUserInfo((prev) => ({ ...prev, status: false, is_typing: false }));
        // console.log('sync', newState);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        const presenceTrackStatus = await roomOne.track(userStatus);
        console.log('presenceTrackStatus', presenceTrackStatus);
      });

    // chat_bot
    botTable();
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

  // 'message' 'bot_answer' 테이블, 메시지 보내는 함수
  const sendMessage = async (newMsg = undefined, id = undefined, table = 'message') => {
    if (!newMsg && newMessage.length === 0 && table === 'message') return;
    const msg = newMsg === undefined ? newMessage : newMsg;

    switch (table) {
      case 'message': {
        await supabase
          .from('messages')
          .insert([{ content: String(msg), user_type: who, room_id: roomId.current, is_read: false }]);
        setNewMessage('');
        setIsFocused(false);
        updateUser(false);
        updateMessage();
        break;
      }
      case 'bot_answer': {
        // 답변 지연
        setTimeout(() => {
          botTable(id);
        }, 1000);
        break;
      }
    }
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
    // console.log('updateMessage', data);
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

  // 'bot' 테이블, 질문/답변 불러오는 함수
  const botTable = async (id = 0, table = 'bot_questions') => {
    const { data, error } = await supabase.from(table).select().eq('id', id);
    console.log(table, data);
    if (error) return console.error('botQuestions Error', error);
    setMessages((prev) => {
      if (prev) return [...prev, data];
      else return [data];
    });
  };

  return (
    <MyContext.Provider value={who}>
      <div className="chat">
        <ChatHeader oppntUserInfo={oppntUserInfo} />
        <ChatRoom
          messages={messages}
          oppntUserInfo={oppntUserInfo}
          sendMessage={sendMessage}
          setNewMessage={setNewMessage}
          isEnter={isEnter}
          setIsEnter={setIsEnter}
        />
        <ChatFooter
          sendMessage={sendMessage}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          setIsFocused={setIsFocused}
          oppntUserInfo={oppntUserInfo}
          isEnter={isEnter}
          setIsEnter={setIsEnter}
        />
      </div>
    </MyContext.Provider>
  );
};

export default App;
