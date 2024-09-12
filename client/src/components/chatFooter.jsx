import './chatFooter.css';
import PropTypes from 'prop-types';

export default function ChatFooter({ sendMessage, newMessage, setNewMessage }) {
  return (
    <div className="chat-footer">
      <input
        className="text_input"
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
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
};
