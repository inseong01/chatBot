import './chatRoom.css';
import PropTypes from 'prop-types';
import Message from './message';
import { useEffect, useRef } from 'react';

export default function ChatRoom({ messages, oppntUserInfo }) {
  const chatRoomRef = useRef(null);

  useEffect(() => {
    const chatRoomHeight = document.querySelector('.chat-room').scrollHeight;
    chatRoomRef.current.scrollTo(0, chatRoomHeight);
  }, [messages, oppntUserInfo]);
  return (
    <div className="chat-room" ref={chatRoomRef}>
      {messages.map((message, index) => (
        <Message key={index} message={message} oppntUserInfo={oppntUserInfo} />
      ))}
      {oppntUserInfo?.is_typing && (
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
    </div>
  );
}

ChatRoom.propTypes = {
  messages: PropTypes.array,
  oppntUserInfo: PropTypes.object,
};
