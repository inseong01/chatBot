import './chatRoom.css';
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Message from './message';
import Dialog from './dialog';

function ChatRoom({ messages, oppntUserInfo, sendMessage, setIsEnter, isEnter }) {
  const chatRoomRef = useRef(null);

  useEffect(() => {
    const chatRoomHeight = document.querySelector('.chat-room').scrollHeight;
    chatRoomRef.current.scrollTo(0, chatRoomHeight);
  }, [messages, oppntUserInfo]);

  return (
    <div className="chat-room" ref={chatRoomRef}>
      <Dialog setIsEnter={setIsEnter} isEnter={isEnter} />
      {messages.map((message, index) => (
        <Message key={index} message={message[0]} oppntUserInfo={oppntUserInfo} sendMessage={sendMessage} />
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

export default ChatRoom;

ChatRoom.propTypes = {
  messages: PropTypes.array,
  oppntUserInfo: PropTypes.object,
  sendMessage: PropTypes.func,
  setIsEnter: PropTypes.func,
  isEnter: PropTypes.bool,
};
