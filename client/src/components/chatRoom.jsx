import './chatRoom.css';
import PropTypes from 'prop-types';
import Message from './message';
import { useEffect, useRef } from 'react';

const getOpponentStatus = (roomId, opntStatusArr) => {
  if (!roomId) return false;
  for (let i = 0; i < opntStatusArr.length; i++) {
    if (roomId !== opntStatusArr[i][0].room_id) continue;
    return opntStatusArr[i];
  }
};

export default function ChatRoom({ messages, userList, roomId }) {
  const chatRoomRef = useRef(null);
  const oppntStatus = getOpponentStatus(roomId, userList);
  const chatRoomMsg = messages.filter((msg) => msg.room_id === roomId);

  useEffect(() => {
    const scrollHeight = document.querySelector('.chat-room').scrollHeight;
    chatRoomRef.current.scrollTo(0, scrollHeight);
  }, [messages]);

  return (
    <div className="chat-room" ref={chatRoomRef}>
      {roomId ? (
        <>
          {chatRoomMsg.map((message, index) => (
            <Message key={index} message={message} userList={userList} />
          ))}
          {oppntStatus[0]?.is_typing && (
            <div className="receive">
              <div className="msg">
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        '채팅방을 선택해주세요'
      )}
    </div>
  );
}

ChatRoom.propTypes = {
  messages: PropTypes.array,
  userList: PropTypes.array,
  roomId: PropTypes.string,
};
