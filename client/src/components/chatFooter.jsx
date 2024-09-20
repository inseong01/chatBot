import { useEffect, useRef } from 'react';
import './chatFooter.css';
import PropTypes from 'prop-types';

export default function ChatFooter({ sendMessage, newMessage, setNewMessage, setIsFocus }) {
  const footerInputRef = useRef(null);
  const onClickInput = () => {
    setIsFocus(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (footerInputRef.current && !footerInputRef.current.contains(e.target)) {
        setIsFocus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="chat-footer" ref={footerInputRef}>
      <input
        className="text_input"
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onClick={onClickInput}
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
  setIsFocus: PropTypes.func,
};
