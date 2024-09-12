import PropTypes from 'prop-types';
import './message.css';

const who = 'admin';

export default function Message({ message }) {
  const content = message.content;
  let msgClassname;
  if (who === 'admin' && message.sender === 'admin') {
    msgClassname = 'send';
  } else if (who === 'admin' && message.sender !== 'admin') {
    msgClassname = 'receive';
  } else if (who === 'client' && message.sender === 'client') {
    msgClassname = 'send';
  } else if (who === 'client' && message.sender !== 'client') {
    msgClassname = 'receive';
  }
  return (
    <div className={msgClassname}>
      <p className="msg">{content}</p>
    </div>
  );
}

Message.propTypes = {
  message: PropTypes.object,
};
