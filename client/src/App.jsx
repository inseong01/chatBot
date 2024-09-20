import './App.css';
import { useState, useEffect, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from './supabase/supabaseClient.js';
import ChatHeader from './components/chatHeader.jsx';
import ChatRoom from './components/chatRoom.jsx';
import ChatFooter from './components/chatFooter.jsx';
import ListWrap from './components/listWrap.jsx';

// https://supabase.com/docs/guides/realtime?queryGroups=language&language=js

const room_id = uuidv4();

// 사용자 정보
const who = 'admin';
const userStatus = {
  user: 'user-0',
  online_at: new Date().toISOString(),
  user_type: who,
  room_id,
};
export const MyContext = createContext(null);

// 채팅목록 방문자 중복 생성 방지
function preventDuplicatedUser(prev, data) {
  // 거르는 조건 (참인 경우)
  const isDuplicated = prev.findIndex(
    (user) =>
      user[0].room_id === data[0].room_id || data[0].user_type === 'admin' || data[0].status === 'offline'
  );
  if (prev.length === 0) {
    return [data];
  } else if (isDuplicated === -1) {
    return [data, ...prev];
  } else {
    return [...prev];
  }
}

// 갱신 정보 덮어씌우는 함수
const overwriteMessages = (prev, data) => {
  return prev.map((item) => {
    const findUpdateItme = data.find((d) => d.id === item.id);
    return findUpdateItme ? findUpdateItme : item;
  });
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userList, setUserList] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [opponentStatusArr, setOpponentStatusArr] = useState([]);

  useEffect(() => {
    // 'user_status' 테이블
    fetchOpponentStatusArr();
    supabase
      .channel('user_status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_status' }, (payload) => {
        console.log('user_status UPDATE', payload);
        // 상대방 변경 정보 추출
        setOpponentStatusArr((prev) => overwriteMessages(prev, [payload.new]));
      })
      .on('postgres_changes', { event: 'SELECT', schema: 'public', table: 'user_status' }, (payload) => {
        console.log('user_status SELECT', payload);
      })
      .subscribe();

    // Realtime 'presence'
    const roomOne = supabase.channel('room-one');
    roomOne
      .on('presence', { event: 'sync' }, () => {
        const newState = roomOne.presenceState();
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
          } else {
            setUserList((prev) => preventDuplicatedUser(prev, data));
          }
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
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        const presenceTrackStatus = await roomOne.track(userStatus);
        console.log(presenceTrackStatus);
      });
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
        // console.log('postgres_changes INSERT', payload);
        if (payload.new.room_id !== roomId) return;
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        // console.log('postgres_changes UPDATE', payload);
        setMessages((prev) => overwriteMessages(prev, [payload.new]));
      })
      .subscribe();
  }, [roomId]);

  // 메시지 업데이트 조건 1 - 읽음
  useEffect(() => {
    if (!isFocus) return;
    updateMessage(roomId);
  }, [isFocus]);

  // 유저 업데이트 조건 1 - 입력중
  useEffect(() => {
    if (newMessage.length > 1) return;
    if (newMessage === '') {
      updateUser(false);
    } else {
      updateUser(true);
    }
  }, [newMessage]);

  // 'message' 테이블, room_id로 메시지 보내는 함수(insert)
  const sendMessage = async () => {
    if (newMessage.length === 0) return;
    await supabase
      .from('messages')
      .insert([{ content: newMessage, user_type: who, room_id: roomId, is_read: false }]);
    setNewMessage('');
    setIsFocus(false);
  };

  // 초기 함수
  // 'messages', room_id 일치하는 메시지 가져오는 함수
  const fetchMessages = async (id) => {
    if (!id) return;
    const { data } = await supabase.from('messages').select('*').eq('room_id', id);
    setMessages(data);
  };
  // 'user_status', 상대방 상태 가져오는 함수
  const fetchOpponentStatusArr = async () => {
    const { data } = await supabase
      .from('user_status')
      .select('*')
      .eq('user_type', 'client')
      .eq('status', 'online');
    setOpponentStatusArr(data);
  };

  // 'messages', room_id 메시지 상태 갱신하는 함수
  const updateMessage = async () => {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .match({ room_id: roomId, user_type: 'client', is_read: false })
      .order('id', { ascending: false })
      .select();
    if (error) return console.error('UpdateMessage Error', error);
    if (!data[0]) return;
  };

  // 'user_status' 테이블, 본인 상태 갱신 함수
  const updateUser = async (isTyping) => {
    const { data, error } = await supabase
      .from('user_status')
      .update({ is_typing: isTyping })
      .match({ user_type: who, room_id: room_id })
      .select();
    if (error) return console.error('UpdateUser Error', error);
  };

  return (
    <MyContext.Provider value={who}>
      <div className="chat">
        <ListWrap userList={userList} setRoomId={setRoomId} />
        <div className="room">
          <ChatHeader icon={false} title={'ChatBot'} btn={false} who={who} />
          <ChatRoom messages={messages} opponentStatusArr={opponentStatusArr} roomId={roomId} />
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
