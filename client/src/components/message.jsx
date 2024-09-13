import './message.css';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { MyContext } from '../App';

export default function Message({ message }) {
  const content = message.content;
  const who = useContext(MyContext);

  let msgType = '';
  if (who === 'admin') {
    msgType = message.user_type === 'admin' ? 'send' : 'receive';
  } else if (who === 'client') {
    msgType = message.user_type !== 'admin' ? 'send' : 'receive';
  } else {
    console.error('who is not defined');
  }

  return (
    <div className={msgType}>
      <p className="msg">{content}</p>
    </div>
  );
}

Message.propTypes = {
  message: PropTypes.object,
};
