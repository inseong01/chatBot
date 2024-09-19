import './App.css';
import { useState, useEffect, createContext, useMemo, useRef } from 'react';
import supabase from './supabase/supabaseClient.js';
import ChatHeader from './components/chatHeader.jsx';
import ChatRoom from './components/chatRoom.jsx';
import ChatFooter from './components/chatFooter.jsx';
import ListWrap from './components/listWrap.jsx';

// https://supabase.com/docs/guides/realtime?queryGroups=language&language=js

const who = 'admin';
export const MyContext = createContext(null);

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userList, setUserList] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
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
        const newState = roomOne.presenceState();
        // 접속자 배열화
        // const newStateArray = [];
        // for (let obj in newState) {
        //   newStateArray.push(newState[obj]);
        // }
        // setUserList(newStateArray);
        console.log('sync', newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', newPresences);
        // 'user_status', 방문한 유저 전달
        const sendVisitUser = async () => {
          // room_id 생성
          const { data, error } = await supabase
            .from('user_status')
            .upsert(
              {
                status: 'online',
                last_updated: String(Date.now()),
                presence_ref: newPresences[0].presence_ref,
                user_type: newPresences[0].user_type,
                user_id: key,
                room_id: newPresences[0].room_id,
              },
              {
                onConflict: 'user_id',
              }
            )
            .select();

          if (error) {
            console.error('Presence join', error);
          } else if (data !== null) {
            setUserList((prev) => [newPresences, ...prev]);
          }
          console.log(data);
        };
        sendVisitUser();
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresence }) => {
        console.log('leave');
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

  // 채팅방 선택, roomId 맞춰 메시지 불러옴
  useEffect(() => {
    if (!roomId) return;
    fetchMessages(roomId);

    supabase.channel('messages').unsubscribe();

    // 'message' 테이블, id 변경될 때 메시지 추가 이벤트 활성화(insert)
    supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log('postgres_changes', payload);
        if (payload.new.room_id !== roomId) return;
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        console.log('UPDATE', payload);
      })
      .subscribe();
  }, [roomId, isUpdate]);

  // 입력창 클릭하면 읽음 처리
  useEffect(() => {
    updateMessage(roomId);
  }, [isFocus]);

  // 'message' 테이블, room_id로 메시지 보내는 함수(insert)
  const sendMessage = async () => {
    if (newMessage.length === 0) return;
    await supabase
      .from('messages')
      .insert([{ content: newMessage, user_type: who, room_id: roomId, is_read: false }]);
    setNewMessage('');
  };

  // 'messages', room_id 일치하는 메시지 가져오는 함수
  const fetchMessages = async (id) => {
    if (!id) return;
    const { data } = await supabase.from('messages').select('*').eq('room_id', id);
    setMessages(data);
  };

  // 'messages', room_id 메시지 정보 갱신하는 함수
  const updateMessage = async (id) => {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .match({ room_id: roomId })
      .select();

    console.log(id);
    if (error) {
      console.error(error);
    } else {
      setIsUpdate((prev) => !prev);
      console.log(data);
    }
  };

  return (
    <MyContext.Provider value={who}>
      <div className="chat">
        <ListWrap userList={userList} setRoomId={setRoomId} />
        <div className="room">
          <ChatHeader icon={false} title={'ChatBot'} btn={false} who={who} />
          <ChatRoom messages={messages} />
          <ChatFooter
            sendMessage={sendMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            setIsFocus={setIsFocus}
          />
        </div>
      </div>
    </MyContext.Provider>
  );
};

export default App;
