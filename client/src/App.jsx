import './App.css';
import { useState, useEffect, createContext } from 'react';
import supabase from './supabase/supabaseClient.js';
import ChatHeader from './components/chatHeader.jsx';
import ChatRoom from './components/chatRoom.jsx';
import ChatFooter from './components/chatFooter.jsx';
import ListWrap from './components/listWrap.jsx';

// https://supabase.com/docs/guides/realtime?queryGroups=language&language=js

const who = 'admin';
export const MyContext = createContext(null);

const App = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    // 'messages' 테이블, 모든 데이터 가져옴
    fetchMessages();

    // 'message' 테이블, 메시지 추가 이벤트 활성화(insert)
    supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .subscribe();

    // 'user_status' 테이블
    supabase
      .channel('user_status')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_status' }, (payload) => {
        console.log('user_status', payload);
      })
      .subscribe();

    // Realtime 'presence'
    const roomOne = supabase.channel('room-one');
    roomOne
      .on('presence', { event: 'sync' }, () => {
        // 접속자 배열화
        const newState = roomOne.presenceState();
        const newStateArray = [];
        for (let obj in newState) {
          newStateArray.push(newState[obj]);
        }
        setUserList(newStateArray);
        console.log('sync', newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', key, newPresences);
        // 'user_status', 방문한 유저 전달
        const sendVisitUser = async () => {
          // room_id 생성
          await supabase.from('user_status').upsert(
            {
              status: 'online',
              last_updated: String(Date.now()),
              presence_ref: newPresences[0].presence_ref,
              user_type: newPresences[0].user_type,
              user_id: key,
              room_id: newPresences[0].room_id || null,
            },
            {
              onConflict: 'user_id',
            }
          );
        };
        sendVisitUser();
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresence }) => {
        console.log('leave', key, leftPresence);
        // 'user_status', 나간 유저 상태 갱신
        const updateLeaveUser = async () => {
          await supabase
            .from('user_status')
            .update([
              {
                status: 'offline',
                last_updated: String(Date.now()),
              },
            ])
            .eq('user_id', key);
        };
        updateLeaveUser();
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
    await supabase
      .from('messages')
      .insert([{ content: newMessage, user_type: who, room_id: '42033d1e-044f-4ed5-a909-79acd8d08fd6' }]);
    setNewMessage('');
  };

  return (
    <MyContext.Provider value={who}>
      {/* {
        // 채팅방 목록 구현
        userList.map((room) => {
          return <div key={room[0].user}>{room[0].user}</div>;
        })
      } */}
      <div className="chat">
        <ListWrap />
        <div className="room">
          <ChatHeader icon={false} title={'ChatBot'} btn={false} who={who} />
          <ChatRoom messages={messages} />
          <ChatFooter sendMessage={sendMessage} newMessage={newMessage} setNewMessage={setNewMessage} />
        </div>
      </div>
    </MyContext.Provider>
  );
};

export default App;
