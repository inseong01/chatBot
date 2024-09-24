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
  if (!prev || prev.length === 0) {
    return [data];
  } else {
    console.log('data', data);
    const isDuplicated = prev.findIndex(
      (user) => user[0].room_id === data[0].room_id || data[0].user_type === 'admin'
    );
    if (isDuplicated !== -1) {
      return prev;
    } else {
      return [data, ...prev];
    }
  }
}

// 갱신 정보 덮어씌우는 함수
const overwriteData = (prev, data, type) => {
  return prev.map((item) => {
    switch (type) {
      case 'user_status': {
        const findUpdateItme = data.find((d) => d.room_id === item[0].room_id);
        return findUpdateItme ? [findUpdateItme] : item;
      }
      case 'messages': {
        const findUpdateItme = data.find((d) => d.id === item.id);
        return findUpdateItme ? findUpdateItme : item;
      }
      default:
        return console.error('overwriteData Error');
    }
  });
};

// 'user_status' 테이블, 유저 상태 갱신
const updateLeaveUser = async (status, key, setUserList) => {
  const id = status === 'online' ? 'room_id' : 'user_id';
  const { data, error } = await supabase
    .from('user_status')
    .update([
      {
        status: status,
        last_updated: String(Date.now()),
      },
    ])
    .eq(id, key)
    .order('online_at', { ascending: true })
    .select();

  if (error) return console.error('updateLeaveUser Error', error);
  else return setUserList((prev) => overwriteData(prev, data, 'user_status'));
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userList, setUserList] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [isFocus, setIsFocus] = useState(false);

  // 채팅방 선택, roomId 맞춰 메시지 불러옴
  useEffect(() => {
    fetchMessages(roomId);

    // 'message' 테이블, 이벤트 활성화
    supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => overwriteData(prev, [payload.new], 'messages'));
      })
      .subscribe();

    // 'user_status' 테이블
    supabase
      .channel('user_status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_status' }, (payload) => {
        console.log('user_status UPDATE', payload);
        // 상대방 변경 정보 추출
        setUserList((prev) => overwriteData(prev, [payload.new], 'user_status'));
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
        // userList 업데이트
        Object.keys(newState).forEach((person) => {
          updateLeaveUser('online', newState[person][0].room_id, setUserList);
        });
        console.log('sync');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', newPresences);
        // 'user_status', 방문한 유저 전달(중복생성 제한)
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
                ignoreDuplicates: 'true',
                onConflict: 'room_id',
              }
            )
            .select();

          if (error) console.error('Presence join', error);
          else setUserList((prev) => preventDuplicatedUser(prev, newPresences));
        };
        sendVisitUser();
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // leftPresences 자동 leave는 undefined
        console.log('leave');
        // 'user_status', 나간 유저 상태 갱신
        updateLeaveUser('offline', key, setUserList);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        const presenceTrackStatus = await roomOne.track(userStatus);
        console.log(presenceTrackStatus);
      });
  }, []);

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
    // if (!id) return;
    const { data } = await supabase.from('messages').select('*');
    // .eq('room_id', id);
    setMessages(data);
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
    console.log('updateMessage', data);
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
        <ListWrap userList={userList} setRoomId={setRoomId} messages={messages} />
        <div className="room">
          <ChatHeader icon={false} title={'ChatBot'} btn={false} who={who} />
          <ChatRoom messages={messages} userList={userList} roomId={roomId} />
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
