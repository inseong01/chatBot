import './message.css';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { MyContext } from '../App';
import BotMessage from './botMessage';

export default function Message({ message, sendMessage }) {
  const content = message.content;
  const who = useContext(MyContext);

  let msgType = '';
  if (who === 'admin') {
    msgType = message.user_type === 'admin' ? 'send' : 'receive';
  } else if (who === 'client') {
    msgType = message.user_type !== 'admin' && message.user_type !== 'bot' ? 'send' : 'receive';
  } else {
    console.error('who is not defined');
  }

  const msgState = message.is_read ? 'read' : 'unread';
  // console.log('message', message);
  return (
    <div className={`${msgType} ${msgState}`}>
      <div className="msg">
        {message.user_type === 'bot' ? (
          <BotMessage key={message.id} message={message} sendMessage={sendMessage} />
        ) : (
          content
        )}
      </div>
    </div>
  );
}

Message.propTypes = {
  message: PropTypes.object,
  sendMessage: PropTypes.func,
};
