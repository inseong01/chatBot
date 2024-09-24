import { useEffect, useRef } from 'react';
import './chatFooter.css';
import PropTypes from 'prop-types';

export default function ChatFooter({ sendMessage, newMessage, setNewMessage, setIsFocused, oppntUserInfo }) {
  const footerRef = useRef(null);
  const onClickTextInput = () => {
    setIsFocused(true);
  };

  useEffect(() => {
    const handleClickOutSide = (e) => {
      if (footerRef.current && !footerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutSide);
    return () => {
      document.removeEventListener('mousedown', handleClickOutSide);
    };
  }, []);

  return (
    <div className="chat-footer" ref={footerRef}>
      <input
        className="text_input"
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onClick={onClickTextInput}
        disabled={!oppntUserInfo.status}
        placeholder={oppntUserInfo.status ? '연락을 시작해보세요~' : '현재 관리자가 오프라인입니다'}
      />
      <button className="text_input_btn" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

ChatFooter.propTypes = {
  sendMessage: PropTypes.func,
  newMessage: PropTypes.string,
  setNewMessage: PropTypes.func,
  setIsFocused: PropTypes.func,
  oppntUserInfo: PropTypes.object,
};
