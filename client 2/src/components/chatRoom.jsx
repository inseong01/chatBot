import './chatRoom.css';
import PropTypes from 'prop-types';
import Message from './message';

export default function ChatRoom({ messages }) {
  return (
    <div className="chat-room">
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
    </div>
  );
}

ChatRoom.propTypes = {
  messages: PropTypes.array,
};
